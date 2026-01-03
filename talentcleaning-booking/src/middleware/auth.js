import admin from "../config/firebaseAdmin.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(token);

    // attach firebase user (IMPORTANT)
    req.firebaseUser = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.email?.split("@")[0],
    };

    // optional: fetch prisma user for role-based auth
    const dbUser = await prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (dbUser) {
      req.user = {
        id: dbUser.id,
        role: dbUser.role,
      };
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};
