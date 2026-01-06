import express from "express";
import {
  createQuoteRequest,
  getAllQuoteRequests,
  updateQuoteRequestStatus,
} from "../controllers/quoteRequest.controller.js";

import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// PUBLIC
router.post("/", createQuoteRequest);

// ADMIN
router.get("/", authenticate, authorizeRoles("admin"), getAllQuoteRequests);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("admin"),
  updateQuoteRequestStatus
);

export default router;
