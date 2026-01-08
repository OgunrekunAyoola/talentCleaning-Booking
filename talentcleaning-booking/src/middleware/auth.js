import admin from "../config/firebaseAdmin.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 1️⃣ Firebase-only authentication
 * - Verifies token
 * - DOES NOT require DB user
 * - Used by /auth/sync ONLY
 */
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("Firebase verify error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * 2️⃣ Full app authentication
 * - Requires existing DB user
 * - Used by ALL protected routes
 */
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.firebaseUser = decoded;

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * 3️⃣ Role guard (unchanged)
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
