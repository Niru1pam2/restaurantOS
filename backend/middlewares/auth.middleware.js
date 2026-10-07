import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

/**
 * Middleware to authenticate requests via JWT token.
 * Reads token from cookie (token) or Authorization header (Bearer <token>).
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication required. Please log in." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res
        .status(401)
        .json({ message: "User belonging to this token no longer exists." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid authentication token." });
    }
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Authentication token has expired. Please log in again." });
    }
    return res.status(500).json({ message: "Internal server error during authentication." });
  }
};

/**
 * Middleware factory for Role-Based Access Control (RBAC).
 * @param {...string} allowedRoles - Roles allowed to access the route (e.g. 'OWNER', 'MANAGER')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden. Role '${req.user.role}' does not have access to this resource.`,
      });
    }

    next();
  };
};
