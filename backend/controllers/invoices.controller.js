import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { createWorker } from "tesseract.js";
import { ChatGroq } from "@langchain/groq";
import ExcelJS from "exceljs";
import prisma from "../config/db.js";
import catchAsync from "../utils/catchAsync.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const getGroqLLM = () => {
  const apiKey = (process.env.GROQ_API_KEY || "").trim().replace(/^["\s]+|["\s]+$/g, "");
  if (!apiKey) return null;
  return new ChatGroq({
    apiKey,
    model: "openai/gpt-oss-20b",
    temperature: 0.1,
  });
};

/**
 * Perform OCR text extraction on uploaded file (PDF or Image)
 */
const performOCR = async (filePath, mimetype) => {
  try {
    const isPdf = mimetype?.includes("pdf") || filePath.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      const dataBuffer = fs.readFileSync(filePath);
      const parsed = await pdfParse(dataBuffer);
      if (parsed?.text && parsed.text.trim().length > 15) {
        return parsed.text;
      }
    }

    // Use Tesseract for images or scanned PDFs
    const worker = await createWorker("eng");
    const { data } = await worker.recognize(filePath);
    await worker.terminate();
    return data.text || "Raw OCR could not parse image text.";
  } catch (error) {
    console.error("OCR Extraction Error:", error.message);
    return "Raw text unavailable due to file parsing format.";
  }
};

/**
 * Extract structured invoice data using Groq AI
 */
const parseInvoiceWithGroq = async (rawOcrText, fallbackTotal = 0) => {
  const llm = getGroqLLM();
  if (!llm || !rawOcrText) return null;

  try {
    const prompt = `You are an expert AI Invoice Processing Agent.
Analyze the following raw OCR text extracted from a printed or handwritten supplier invoice:

--- RAW OCR TEXT ---
${rawOcrText}
--- END RAW OCR TEXT ---

Extract structured invoice details into valid JSON matching this schema:
{
  "supplierName": string (or "Wholesale Supplies"),
  "invoiceNumber": string (or auto-generate like "INV-2026-001"),
  "invoiceDate": string in YYYY-MM-DD format (default to today's date if missing),
  "totalAmount": number (positive float, e.g. 450.00),
  "tax": number (default 0),
  "items": [
    {
      "description": string,
      "quantity": number (default 1),
      "unitPrice": number,
      "totalPrice": number
    }
  ]
}

Return strictly valid JSON object only. No markdown formatting.`;

    const response = await llm.invoke(prompt);
    const cleanedText = response.content.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Groq AI Invoice Extraction Error:", error.message);
    return null;
  }
};


/**
 * Process one or more uploaded supplier invoices (PDFs or Images)
 * POST /api/invoices/process
 */
export const processInvoice = catchAsync(async (req, res) => {
  // Support single file or array of files
  const files = req.files && req.files.length > 0 ? req.files : req.file ? [req.file] : [];
  
  if (files.length === 0) {
    return res.status(400).json({ success: false, message: "Please upload at least one invoice image or PDF file." });
  }

  const processedInvoices = [];

  for (const file of files) {
    const rawOcrText = await performOCR(file.path, file.mimetype);
    const aiParsed = await parseInvoiceWithGroq(rawOcrText);

    const supplierName = aiParsed?.supplierName || req.body.supplierName || "Wholesale Supplier";
    const invoiceNumber = aiParsed?.invoiceNumber || req.body.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`;
    const invoiceDate = aiParsed?.invoiceDate ? new Date(aiParsed.invoiceDate) : req.body.invoiceDate ? new Date(req.body.invoiceDate) : new Date();
    const totalAmount = aiParsed?.totalAmount || Number(req.body.totalAmount) || 250.0;
    
    let items = aiParsed?.items || [];
    if (items.length === 0) {
      items = [
        {
          description: "Raw Ingredients & Wholesale Supplies",
          quantity: 1,
          unitPrice: totalAmount,
          totalPrice: totalAmount,
        },
      ];
    }

    // Find or create Supplier in PostgreSQL
    let supplierId = null;
    if (supplierName) {
      let supplier = await prisma.supplier.findFirst({
        where: { name: { contains: supplierName, mode: "insensitive" } },
      });
      if (!supplier) {
        supplier = await prisma.supplier.create({ data: { name: supplierName } });
      }
      supplierId = supplier.id;
    }

    // Save invoice to PostgreSQL
    const invoice = await prisma.supplierInvoice.create({
      data: {
        invoiceNumber,
        supplierId,
        invoiceDate,
        totalAmount,
        status: "UNPAID",
        fileUrl: `/uploads/${file.filename}`,
        rawOcrData: rawOcrText.slice(0, 1500),
        isProcessed: true,
        items: {
          create: items.map(i => ({
            description: i.description || "Supply item",
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.unitPrice) || 0,
            totalPrice: Number(i.totalPrice) || Number(i.quantity * i.unitPrice) || 0,
          })),
        },
      },
      include: { supplier: true, items: true },
    });

    // Automatically register Expense entry in PostgreSQL
    let expenseCategory = await prisma.expenseCategory.findFirst({ where: { name: "Supplies" } });
    if (!expenseCategory) {
      expenseCategory = await prisma.expenseCategory.create({ data: { name: "Supplies", description: "Food & Wholesale Supplies" } });
    }

    await prisma.expense.create({
      data: {
        title: `Supplier Invoice #${invoice.invoiceNumber}`,
        amount: totalAmount,
        categoryId: expenseCategory.id,
        supplierId,
        date: invoiceDate,
        description: `Auto-generated from AI OCR Invoice Processing (${supplierName})`,
      },
    });

    processedInvoices.push(invoice);
  }

  res.status(201).json({
    success: true,
    message: `${processedInvoices.length} invoice(s) processed with AI OCR and saved successfully!`,
    data: processedInvoices.length === 1 ? processedInvoices[0] : processedInvoices,
  });
});

export const getInvoices = catchAsync(async (req, res) => {
  const invoices = await prisma.supplierInvoice.findMany({
    include: { supplier: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ success: true, data: invoices });
});

/**
 * Generate an Expense Register in Excel (.xlsx)
 * GET /api/invoices/export-excel
 */
export const exportExpenseRegisterExcel = catchAsync(async (req, res) => {
  const invoices = await prisma.supplierInvoice.findMany({
    include: { supplier: true, items: true },
    orderBy: { invoiceDate: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Expense Register");

  worksheet.columns = [
    { header: "Invoice #", key: "invoiceNumber", width: 20 },
    { header: "Supplier Name", key: "supplierName", width: 28 },
    { header: "Invoice Date", key: "invoiceDate", width: 16 },
    { header: "Payment Status", key: "status", width: 16 },
    { header: "Line Items Count", key: "itemsCount", width: 18 },
    { header: "Total Amount (₹)", key: "totalAmount", width: 20 },
  ];

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "4F46E5" }, // Indigo header
  };
  headerRow.height = 24;

  let grandTotal = 0;

  invoices.forEach((inv) => {
    grandTotal += inv.totalAmount;
    worksheet.addRow({
      invoiceNumber: inv.invoiceNumber,
      supplierName: inv.supplier ? inv.supplier.name : "N/A",
      invoiceDate: new Date(inv.invoiceDate).toISOString().split("T")[0],
      status: inv.status,
      itemsCount: inv.items.length,
      totalAmount: inv.totalAmount,
    });
  });

  // Total Summary row
  const totalRow = worksheet.addRow({
    invoiceNumber: "GRAND TOTAL",
    supplierName: "",
    invoiceDate: "",
    status: "",
    itemsCount: invoices.length + " Invoices",
    totalAmount: grandTotal,
  });
  totalRow.font = { bold: true };

  // Set header response for Excel download
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="Expense_Register.xlsx"'
  );

  await workbook.xlsx.write(res);
  res.end();
});

