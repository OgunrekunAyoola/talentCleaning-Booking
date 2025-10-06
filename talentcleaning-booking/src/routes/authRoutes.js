import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Register route (auth needed only if assigning ADMIN or CLEANER)
router.post("/register", authenticate, registerUser);

// Login route
router.post("/login", loginUser);

export default router;
