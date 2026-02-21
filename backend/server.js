const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db");
const errorHandler = require("./middleware/errorHandler");

// Route modules
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

// Health check
app.get("/", (req, res) => {
  res.json({ message: "FleetFlow Backend Running", version: "1.0.0" });
});

// Mount routes
app.use("/vehicles", vehicleRoutes);
app.use("/drivers", driverRoutes);
app.use("/trips", tripRoutes);
app.use("/fuel", fuelRoutes);
app.use("/maintenance", maintenanceRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/regions", regionRoutes);

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`FleetFlow API running on http://localhost:${PORT}`);
  console.log("Routes: /vehicles, /drivers, /trips, /fuel, /maintenance, /analytics");
});