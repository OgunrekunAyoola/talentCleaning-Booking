import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create a booking
 */
export const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      startAt,
      endAt,
      clientName,
      clientEmail,
      clientPhone,
      address,
      serviceType,
      notes,
    } = req.body;

    // Optional: ensure authentication if required
    if (!req.user)
      return res.status(401).json({ message: "Authentication required" });

    // Validate required fields
    if (!serviceId || !startAt || !clientName || !clientPhone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check service exists
    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) },
    });
    if (!service) return res.status(404).json({ message: "Service not found" });

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        address,
        serviceType,
        price: service.basePrice,
        notes,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        status: "pending",
      },
      include: {
        quote: true,
        attachments: true,
        history: true,
        // service: true // optional if model connected
      },
    });

    // Create initial history event
    await prisma.bookingEvent.create({
      data: {
        eventType: "CREATED",
        message: `Booking created for ${clientName}`,
        bookingId: booking.id,
      },
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all bookings (Admin)
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        service: true,
        extras: {
          include: { extra: true },
        },
        assignedTo: true,
        attachments: true,
        history: true,
        payment: true,
      },
    });

    res.json(bookings);
  } catch (err) {
    console.error("Get all bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get booking details (Admin or Client)
 */
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        quote: true,
        attachments: true,
        history: true,
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    res.json(booking);
  } catch (err) {
    console.error("Get booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update booking status (Admin)
 */
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await prisma.booking.update({
      where: { id: Number(id) },
      data: {
        status,
        notes,
      },
    });

    // Add history log
    await prisma.bookingEvent.create({
      data: {
        eventType: "STATUS_UPDATE",
        message: `Booking status updated to ${status}`,
        bookingId: booking.id,
      },
    });

    res.json({ message: "Booking updated", booking });
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Upload booking attachment (Admin)
 */
export const addBookingFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileUrl, fileType } = req.body;

    const file = await prisma.bookingFile.create({
      data: {
        fileUrl,
        fileType,
        bookingId: Number(id),
      },
    });

    await prisma.bookingEvent.create({
      data: {
        eventType: "FILE_ADDED",
        message: `File uploaded: ${fileUrl}`,
        bookingId: Number(id),
      },
    });

    res.status(201).json({ message: "File added", file });
  } catch (err) {
    console.error("Add file error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Delete booking (Admin)
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const existingBooking = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!existingBooking)
      return res.status(404).json({ message: "Booking not found" });

    await prisma.booking.delete({
      where: { id: Number(id) },
    });

    await prisma.bookingEvent.create({
      data: {
        eventType: "DELETED",
        message: `Booking deleted (ID: ${id})`,
        bookingId: Number(id),
      },
    });

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
