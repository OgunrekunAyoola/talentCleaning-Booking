import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// ✅ Admin: Get all users
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllUsers);

export default router;
