import jwt from "jsonwebtoken";

/**
 * Helper to generate JWT token and cookie response
 */
export const generateTokenAndResponse = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("token", token, cookieOptions);

  const { password, ...userWithoutPassword } = user;

  res.status(statusCode).json({
    success: true,
    token,
    user: userWithoutPassword,
  });
};
