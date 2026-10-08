import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { processInvoice, getInvoices, exportExpenseRegisterExcel } from "../api/invoices.api";

export default function AiInvoiceProcessing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await getInvoices();
      if (res.success) setInvoices(res.data);
    } catch (err) {
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadAndProcess = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) return;
    setProcessing(true);
    setMessage(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      const res = await processInvoice(formData);
      if (res.success) {
        setMessage({ type: "success", text: res.message || "Invoices processed with AI OCR!" });
        setSelectedFiles([]);
        fetchInvoices();
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to process invoices." });
    } finally {
      setProcessing(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      const blobData = await exportExpenseRegisterExcel();
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Expense_Register.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Excel Export Error:", err);
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-7xl space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">AI Invoice Processing & Expense Register</h1>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Printed & Handwritten OCR
              </span>
            </div>
            <p className="text-slate-400 text-sm mt-1">Upload printed/handwritten supplier invoices to extract data using AI OCR.</p>
          </div>
          <button onClick={handleExportExcel} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold cursor-pointer">
            Export Expense Register (.xlsx)
          </button>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === "success" ? "bg-emerald-950/40 text-emerald-300 border-emerald-800" : "bg-red-950/40 text-red-300 border-red-800"}`}>
            {message.text}
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white">Upload Supplier Invoices (PDF or Images)</h2>
          <form onSubmit={handleUploadAndProcess} className="space-y-4">
            <div className="border-2 border-dashed border-slate-700 bg-slate-950/50 p-6 rounded-2xl text-center cursor-pointer">
              <input type="file" multiple accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="invoice-file-input" />
              <label htmlFor="invoice-file-input" className="cursor-pointer space-y-2 block">
                <p className="text-sm text-slate-300 font-semibold">Click to select printed or handwritten invoice files (PDF, PNG, JPG)</p>
                <p className="text-xs text-slate-500">Supports multi-file upload for batch processing</p>
              </label>
              {selectedFiles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {selectedFiles.map((file, idx) => (
                    <span key={idx} className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800 px-3 py-1 rounded-lg">{file.name}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={selectedFiles.length === 0 || processing} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold cursor-pointer">
                {processing ? "Extracting Data via AI OCR..." : `Process ${selectedFiles.length || ""} Invoice(s)`}
              </button>
            </div>
          </form>
        </div>

        <InvoicesTable invoices={invoices} loading={loading} onSelect={setSelectedInvoice} />
        {selectedInvoice && <InvoiceModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}
      </div>
    </Layout>
  );
}

function InvoicesTable({ invoices, loading, onSelect }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <h3 className="text-base font-bold text-white">Extracted Invoices Directory</h3>
        <span className="text-xs text-slate-400">{invoices.length} invoices saved in PostgreSQL</span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading extracted invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm">No invoices uploaded yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-medium text-slate-200">{inv.supplier?.name || "Wholesale Supplier"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs text-slate-300 font-mono">{inv.items?.length || 0} line items</td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">₹{inv.totalAmount?.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onSelect(inv)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg border border-slate-700 cursor-pointer">
                      View Line Items
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InvoiceModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-start border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Invoice #{invoice.invoiceNumber}</h3>
            <p className="text-xs text-slate-400 mt-1">Supplier: {invoice.supplier?.name || "N/A"}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-slate-500">Invoice Date</span>
            <p className="text-slate-200 font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-slate-500">Total Amount</span>
            <p className="text-emerald-400 font-bold font-mono text-base">₹{invoice.totalAmount?.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-slate-400 uppercase mb-2">Extracted Line Items</h4>
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden divide-y divide-slate-800 text-xs">
            {invoice.items?.map((item, i) => (
              <div key={i} className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white">{item.description}</p>
                  <p className="text-slate-400">Qty: {item.quantity} × ₹{item.unitPrice}</p>
                </div>
                <span className="font-mono font-bold text-emerald-400">₹{item.totalPrice?.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {invoice.rawOcrData && (
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Raw OCR Text Snippet</h4>
            <p className="text-[11px] font-mono text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 max-h-28 overflow-y-auto whitespace-pre-wrap">
              {invoice.rawOcrData}
            </p>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer">Close</button>
        </div>
      </div>
    </div>
  );
}
