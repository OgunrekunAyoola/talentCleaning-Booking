import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create a booking
 */
export const createBooking = async (req, res) => {
  try {
    const user = req.user;
    if (!user)
      return res.status(401).json({ message: "Authentication required" });

    const {
      serviceId,
      clientName,
      clientEmail,
      clientPhone,
      address,
      serviceType,
      startAt,
      endAt,
      notes,
      propertySize,
      visitFrequency,
    } = req.body;

    if (!clientName || !clientPhone || !startAt || !serviceId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // serviceId MUST exist because schema requires it
    const service = await prisma.service.findUnique({
      where: { id: Number(serviceId) },
    });

    if (!service) {
      return res.status(400).json({ message: "Invalid serviceId" });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        serviceId: service.id,
        startAt: new Date(startAt),
        endAt: endAt ? new Date(endAt) : null,
        addressLine1: address || "",
        phone: clientPhone,
        status: "PENDING",
        notes,
        metadata: {
          serviceType,
          propertySize,
          visitFrequency,
          clientEmail,
        },
        total: service.basePrice,
        currency: "NGN",
      },
    });

    await prisma.bookingEvent.create({
      data: {
        type: "CREATED",
        message: `Booking created for ${clientName}`,
        bookingId: booking.id,
      },
    });

    return res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (err) {
    console.error("Booking creation failed:", err);
    return res.status(500).json({
      message: "Server error during booking creation",
      error: err.message,
    });
  }
};

/**
 * Get all bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        service: true,
        extras: { include: { extra: true } },
        assignedTo: true,
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
 * Get booking by ID
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

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { clientId: userId },
      include: {
        service: true,
        quote: true,
        attachments: true,
        history: true,
      },
    });

    res.json(bookings);
  } catch (err) {
    console.error("Get my bookings error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Update booking status
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
        type: "STATUS_UPDATE",
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
 * Add booking file
 */
export const addBookingFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { url, filename, mimeType } = req.body;

    if (!url || !filename || !mimeType) {
      return res
        .status(400)
        .json({ message: "Missing file fields (url, filename, mimeType)" });
    }

    const file = await prisma.bookingFile.create({
      data: {
        bookingId: Number(id),
        url,
        filename,
        mimeType,
      },
    });

    await prisma.bookingEvent.create({
      data: {
        type: "FILE_ADDED",
        message: `File uploaded: ${filename}`,
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
 * Delete booking
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.booking.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Log BEFORE deletion, to respect FK
    await prisma.bookingEvent.create({
      data: {
        type: "DELETED",
        message: `Booking deleted (ID: ${id})`,
        bookingId: existing.id,
      },
    });

    await prisma.booking.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error("Delete booking error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
