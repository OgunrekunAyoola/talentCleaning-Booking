import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  addBookingFile,
  getMyBookings,
} from "../controllers/bookingController.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

/**
 * Booking Routes
 */

// 👤 Client: Create booking
router.post("/", authenticate, createBooking);

// 👤 Client: Get own bookings
router.get("/me", authenticate, getMyBookings);

// 🔐 Admin: Get all bookings
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllBookings);

// 👤 Admin OR Owner (handled in controller)
router.get("/:id", authenticate, getBookingById);

// 🔐 Admin: Update booking status
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  updateBookingStatus
);

// 🔐 Admin: Upload booking files
router.post(
  "/:id/files",
  authenticate,
  authorizeRoles("ADMIN"),
  addBookingFile
);

// 🔐 Admin: Delete booking
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteBooking);

export default router;
