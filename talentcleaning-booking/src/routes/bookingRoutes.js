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
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/**
 * Booking Routes
 */

// ✅ Create a new booking (Client)
router.post("/", authenticate, createBooking);

// ✅ Get all bookings (Admin dashboard)
router.get("/", authenticate, getAllBookings);

// get singleuser bookings
router.get("/me", authenticate, getMyBookings);

// ✅ Get single booking details (Admin or Client)
router.get("/:id", authenticate, getBookingById);

// ✅ Update booking status or notes (Admin)
router.patch("/:id/status", authenticate, updateBookingStatus);

// ✅ Upload a booking file (Admin)
router.post("/:id/files", authenticate, addBookingFile);

// ✅ Delete booking (Admin)
router.delete("/:id", authenticate, deleteBooking);

export default router;
