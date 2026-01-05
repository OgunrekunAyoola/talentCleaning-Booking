import express from "express";
import { syncUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.get("/sync", authenticate, syncUser);

export default router;
