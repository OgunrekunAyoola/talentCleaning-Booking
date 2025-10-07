import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import serviceRoutes from "./src/routes/serviceRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));

app.use(express.json());

// Example test route
app.get("/", (req, res) => res.send("Booking System API running successfully"));

// TODO: Add your routes here
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);

// Global error handler (must come after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
