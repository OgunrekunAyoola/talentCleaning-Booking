// src/routes/servicesRoute.js
import express from "express";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

// Public route
router.get("/", getServices);
router.get("/:id", getServiceById);

// Admin-only routes
router.post("/", authenticate, authorizeRoles("ADMIN"), createService);
router.put("/:id", authenticate, authorizeRoles("ADMIN"), updateService);
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteService);

export default router;
