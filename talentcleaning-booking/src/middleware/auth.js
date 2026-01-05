import admin from "../config/firebaseAdmin.js";

/**
 * Authenticate Firebase token ONLY
 * Attach decoded Firebase user to req.firebaseUser
 */
export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = header.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    req.firebaseUser = decoded; // 👈 IMPORTANT
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
