// src/controllers/servicesController.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Admin only
export const createService = async (req, res) => {
  try {
    const { code, name, description, basePrice, duration } = req.body;
    const service = await prisma.service.create({
      data: { code, name, description, basePrice, duration },
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Public
export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
    });
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin only
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const service = await prisma.service.update({
      where: { id: Number(id) },
      data,
    });
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin only
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    next(error);
  }
};
