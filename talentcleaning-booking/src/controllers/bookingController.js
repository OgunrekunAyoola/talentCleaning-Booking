import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create a booking (REAL SERVICE BOOKING)
 */
export const createBooking = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Authentication required" });

    const {
      serviceId,
      startAt,
      addressLine1,
      addressLine2,
      city,
      postcode,
      phone,
      notes,
    } = req.body;

    if (!serviceId || !startAt || !addressLine1 || !phone) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) },
    });

    if (!service) {
      return res.status(400).json({ message: "Invalid service" });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        serviceId: service.id,
        startAt: new Date(startAt),
        addressLine1,
        addressLine2,
        city,
        postcode,
        phone,
        notes,
        status: "PENDING",
        total: service.basePrice,
        currency: "NGN",
      },
    });

    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        type: "CREATED",
        message: "Booking created",
      },
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get my bookings (client)
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { clientId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        history: true,
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin – get all bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        service: true,
        assignedTo: true,
        history: true,
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error("Get all bookings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update booking status (ADMIN)
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: { status, notes },
    });

    await prisma.bookingEvent.create({
      data: {
        bookingId: booking.id,
        type: "STATUS_UPDATE",
        message: `Status changed to ${status}`,
      },
    });

    res.json({ booking });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete booking (ADMIN)
 */
export const deleteBooking = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // 🔍 Check if it exists first
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    await prisma.booking.delete({
      where: { id },
    });

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Failed to delete booking" });
  }
};
