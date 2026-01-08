import admin from "../config/firebaseAdmin.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Authenticate user via Firebase token
 * ALWAYS guarantees a database user exists
 */
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    // ✅ Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(token);

    // ✅ Find user in DB
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    // ✅ AUTO-CREATE USER IF MISSING (THIS IS THE FIX)
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: decoded.uid,

          // prevent Prisma crashes
          email: decoded.email ?? `${decoded.uid}@firebase.local`,
          name: decoded.name ?? decoded.displayName ?? "User",

          // default role
          role: "CLIENT",
        },
      });
    }

    // ✅ Attach both
    req.user = user;
    req.firebaseUser = decoded;

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
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
