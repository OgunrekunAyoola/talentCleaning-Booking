import express from "express";
import {
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBookingStatus,
  deleteBooking,
} from "../controllers/BookingController.js";

import { authenticate, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Client: create booking
router.post("/", authenticate, createBooking);

// Client: see my bookings
router.get("/me", authenticate, getMyBookings);

// Admin: see all bookings
router.get("/", authenticate, authorizeRoles("ADMIN"), getAllBookings);

// Admin/Cleaner: update booking status
router.put(
  "/:id",
  authenticate,
  authorizeRoles("ADMIN", "CLEANER"),
  updateBookingStatus
);

// Admin: delete booking
router.delete("/:id", authenticate, authorizeRoles("ADMIN"), deleteBooking);

export default router;
