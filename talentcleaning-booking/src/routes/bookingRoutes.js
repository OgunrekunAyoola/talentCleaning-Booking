import express from "express";
import {
  createBooking,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
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

// 🔐 Admin: Update booking status
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles("ADMIN"),
  updateBookingStatus
);

// 🔐 Admin: Delete booking
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteBooking);

export default router;
