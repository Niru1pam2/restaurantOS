import prisma from "../config/db.js";
import bcrypt from "bcryptjs";
import { VALID_ROLES } from "../utils/constants.js";
import catchAsync from "../utils/catchAsync.js";

const STAFF_SELECT = { id: true, name: true, email: true, role: true, createdAt: true };

export const getStaff = catchAsync(async (req, res) => {
  const staff = await prisma.user.findMany({ select: STAFF_SELECT, orderBy: { createdAt: "desc" } });
  res.json({ success: true, data: staff });
});

export const createStaff = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: "Name, email, password, and role are required" });
  }

  const assignedRole = role.toUpperCase();
  if (!VALID_ROLES.includes(assignedRole)) {
    return res.status(400).json({ success: false, message: "Invalid role specified" });
  }

  const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existingUser) {
    return res.status(400).json({ success: false, message: "Email already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: email.toLowerCase(), password: hashedPassword, role: assignedRole },
    select: STAFF_SELECT,
  });

  res.status(201).json({ success: true, data: user });
});

export const updateStaff = catchAsync(async (req, res) => {
  const staffId = Number(req.params.id);
  const { name, email, role, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { id: staffId } });
  if (!existingUser) {
    return res.status(404).json({ success: false, message: "Staff member not found" });
  }

  const dataToUpdate = {};
  if (name) dataToUpdate.name = name;
  if (email && email.toLowerCase() !== existingUser.email) {
    const emailTaken = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (emailTaken) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }
    dataToUpdate.email = email.toLowerCase();
  }
  if (role && VALID_ROLES.includes(role.toUpperCase())) {
    dataToUpdate.role = role.toUpperCase();
  }
  if (password && password.trim() !== "") {
    dataToUpdate.password = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: { id: staffId },
    data: dataToUpdate,
    select: STAFF_SELECT,
  });

  res.json({ success: true, data: user });
});

export const deleteStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  if (Number(id) === req.user.id) {
    return res.status(400).json({ success: false, message: "You cannot delete your own account" });
  }
  await prisma.user.delete({ where: { id: Number(id) } });
  res.json({ success: true, message: "Staff member removed successfully" });
});
