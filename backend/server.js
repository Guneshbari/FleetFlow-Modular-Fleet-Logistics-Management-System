const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const errorHandler = require("./middleware/errorHandler");
const { authenticateToken } = require("./middleware/auth");

// Route modules
const authRoutes = require("./routes/auth");
const vehicleRoutes = require("./routes/vehicles");
const driverRoutes = require("./routes/drivers");
const tripRoutes = require("./routes/trips");
const fuelRoutes = require("./routes/fuel");
const maintenanceRoutes = require("./routes/maintenance");
const analyticsRoutes = require("./routes/analytics");
const regionRoutes = require("./routes/regions");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (public)
app.get("/", (req, res) => {
  res.json({ message: "FleetFlow Backend Running", version: "2.0.0" });
});

// Auth routes (public — no JWT required)
app.use("/auth", authRoutes);

// Protected routes — require JWT or x-role header
app.use("/vehicles", authenticateToken, vehicleRoutes);
app.use("/drivers", authenticateToken, driverRoutes);
app.use("/trips", authenticateToken, tripRoutes);
app.use("/fuel", authenticateToken, fuelRoutes);
app.use("/maintenance", authenticateToken, maintenanceRoutes);
app.use("/analytics", authenticateToken, analyticsRoutes);
app.use("/regions", authenticateToken, regionRoutes);

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FleetFlow API running on http://localhost:${PORT}`);
  console.log("Routes: /auth, /vehicles, /drivers, /trips, /fuel, /maintenance, /analytics, /regions");
});