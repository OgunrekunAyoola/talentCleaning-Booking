import express from "express";
import { verifyFirebaseToken } from "../middleware/auth.js";
import { syncUser } from "../controllers/authController.js";

const router = express.Router();

router.get("/sync", verifyFirebaseToken, syncUser);

export default router;
