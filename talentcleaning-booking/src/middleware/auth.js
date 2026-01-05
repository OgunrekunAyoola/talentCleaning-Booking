import admin from "../config/firebaseAdmin.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Authenticate user via Firebase token
 * and attach full DB user to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    // 🔹 Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // 🔹 Find user in database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔹 Attach user (IMPORTANT)
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Role-based authorization
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
