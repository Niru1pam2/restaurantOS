import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { VALID_ROLES } from "../utils/constants.js";
import { generateTokenAndResponse } from "../utils/token.util.js";
import catchAsync from "../utils/catchAsync.js";

export const register = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  const assignedRole = role ? role.toUpperCase() : "WAITER";
  if (!VALID_ROLES.includes(assignedRole)) {
    return res.status(400).json({
      message: `Invalid role. Allowed roles are: ${VALID_ROLES.join(", ")}`,
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    return res.status(400).json({ message: "An account with this email already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
    },
  });

  generateTokenAndResponse(user, 201, res);
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  generateTokenAndResponse(user, 200, res);
});

export const logout = (req, res) => {
  res.cookie("token", "", {
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true, message: "Logged out successfully." });
};

export const getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

export const getOwnerOnly = (req, res) => {
  res.json({ message: "Welcome Owner! Access granted to high-level system settings." });
};

export const getKitchen = (req, res) => {
  res.json({ message: "Kitchen access granted." });
};
