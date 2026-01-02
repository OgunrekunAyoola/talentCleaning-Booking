import express from "express";
import { syncUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authenticate, syncUser);

export default router;
