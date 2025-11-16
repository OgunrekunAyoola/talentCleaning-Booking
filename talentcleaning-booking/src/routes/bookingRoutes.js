import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  addBookingFile,
} from "../controllers/bookingController.js";
import { authenticate } from "../middleware/auth.js";

router.post("/", authenticate, createBooking);

const router = express.Router();

/**
 * Booking Routes
 */

// ✅ Create a new booking (Client)
router.post("/", authenticate, createBooking);

// ✅ Get all bookings (Admin dashboard)
router.get("/", getAllBookings);

// ✅ Get single booking details (Admin or Client)
router.get("/:id", getBookingById);

// ✅ Update booking status or notes (Admin)
router.patch("/:id/status", updateBookingStatus);

// ✅ Upload a booking file (Admin)
router.post("/:id/files", addBookingFile);

// ✅ Delete booking (Admin)
router.delete("/:id", deleteBooking);

export default router;
