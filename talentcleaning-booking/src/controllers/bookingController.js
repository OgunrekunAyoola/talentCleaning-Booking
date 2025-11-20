import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create a booking
 */

export const createBooking = async (req, res) => {
  try {
    // Only logged-in clients can book
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

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

    // Validate required fields
    if (!clientName || !clientPhone || !startAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Optional: try to find service, but allow booking even if not found
    let service = null;
    if (serviceId) {
      service = await prisma.service.findUnique({
        where: { id: Number(serviceId) },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        serviceId: service ? service.id : null, // allow null if service not found
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
        total: service ? service.basePrice : 0,
        currency: "NGN",
      },
    });

    // Optionally create initial history event
    await prisma.bookingEvent.create({
      data: {
        eventType: "CREATED",
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

    // Return detailed error to frontend
    return res.status(500).json({
      message: "Server error during booking creation",
      error: err.message,
      stack: err.stack,
    });
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
