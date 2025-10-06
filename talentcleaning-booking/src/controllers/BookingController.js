import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a booking
export const createBooking = async (req, res) => {
  try {
    const {
      serviceId,
      startAt,
      addressLine1,
      addressLine2,
      city,
      postcode,
      extras,
    } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // check if service exists
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) return res.status(404).json({ message: "Service not found" });

    // calculate end time (simple: add service.duration minutes)
    const start = new Date(startAt);
    const end = new Date(start.getTime() + service.duration * 60000);

    // create booking
    const booking = await prisma.booking.create({
      data: {
        clientId: req.user.id,
        serviceId,
        startAt: start,
        endAt: end,
        addressLine1,
        addressLine2,
        city,
        postcode,
        total: service.basePrice, // can be updated with extras
        status: "PENDING",
      },
      include: { service: true },
    });

    // if extras exist, attach them
    if (extras && extras.length > 0) {
      for (const ex of extras) {
        await prisma.bookingExtra.create({
          data: {
            bookingId: booking.id,
            extraId: ex.extraId,
            quantity: ex.quantity || 1,
          },
        });
      }
    }

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all bookings (admin)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { service: true, client: true, assignedTo: true, extras: true },
    });
    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get client’s bookings
export const getMyBookings = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ message: "Authentication required" });

    const bookings = await prisma.booking.findMany({
      where: { clientId: req.user.id },
      include: { service: true, extras: true },
    });

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update booking status (admin/cleaner)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedToId } = req.body;

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status, assignedToId },
    });

    res.json({ message: "Booking updated", booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a booking (admin only)
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const existingService = await prisma.service.findUnique({
      where: { id: Number(id) },
    });

    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    await prisma.service.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
