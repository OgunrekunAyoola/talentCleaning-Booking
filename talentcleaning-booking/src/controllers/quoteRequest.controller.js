import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Create Quote Request (PUBLIC – Contact / Request Quote)
 */
export const createQuoteRequest = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      serviceType,
      propertySize,
      frequency,
      message,
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: "Name, email, and phone are required",
      });
    }

    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        name,
        email,
        phone,
        serviceType,
        propertySize,
        frequency,
        message,
        status: "NEW",
      },
    });

    res.status(201).json({ quoteRequest });
  } catch (error) {
    console.error("Create quote request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin – Get all quote requests
 */
export const getAllQuoteRequests = async (req, res) => {
  try {
    const quotes = await prisma.quoteRequest.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(quotes);
  } catch (error) {
    console.error("Get quote requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Admin – Update quote request status
 */
export const updateQuoteRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const quoteRequest = await prisma.quoteRequest.update({
      where: { id: Number(id) },
      data: { status },
    });

    res.json({ quoteRequest });
  } catch (error) {
    console.error("Update quote request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
