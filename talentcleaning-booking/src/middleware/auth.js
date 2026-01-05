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

    // 👇 DECODE WITHOUT VERIFYING
    const decodedUnverified = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    console.log("TOKEN ISSUER:", decodedUnverified.iss);
    console.log("TOKEN AUD:", decodedUnverified.aud);

    // 👇 VERIFY
    const decoded = await admin.auth().verifyIdToken(token);

    req.firebaseUser = decoded;
    next();
  } catch (err) {
    console.error("verifyIdToken FAILED:", err.message);
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
