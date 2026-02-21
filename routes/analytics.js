const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /analytics/summary — Fleet-wide analytics
router.get("/summary", (req, res) => {
  // Total vehicles by status
  const vehicleCounts = db.prepare(`
    SELECT
      COUNT(*) AS total_vehicles,
      SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
      SUM(CASE WHEN status = 'OnTrip' THEN 1 ELSE 0 END) AS on_trip,
      SUM(CASE WHEN status = 'InShop' THEN 1 ELSE 0 END) AS in_shop,
      SUM(CASE WHEN status = 'Retired' THEN 1 ELSE 0 END) AS retired
    FROM vehicles
  `).get();

  // Total drivers by status
  const driverCounts = db.prepare(`
    SELECT
      COUNT(*) AS total_drivers,
      SUM(CASE WHEN status = 'OnDuty' THEN 1 ELSE 0 END) AS on_duty,
      SUM(CASE WHEN status = 'OnTrip' THEN 1 ELSE 0 END) AS on_trip,
      SUM(CASE WHEN status = 'Suspended' THEN 1 ELSE 0 END) AS suspended
    FROM drivers
  `).get();

  // Trip stats
  const tripStats = db.prepare(`
    SELECT
      COUNT(*) AS total_trips,
      SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) AS draft,
      SUM(CASE WHEN status = 'Dispatched' THEN 1 ELSE 0 END) AS dispatched,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
      SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN revenue ELSE 0 END), 0) AS total_revenue
    FROM trips
  `).get();

  // Total costs
  const fuelCost = db.prepare(
    "SELECT COALESCE(SUM(cost), 0) AS total FROM fuel_logs"
  ).get().total;

  const maintenanceCost = db.prepare(
    "SELECT COALESCE(SUM(cost), 0) AS total FROM maintenance_logs"
  ).get().total;

  const totalOperationalCost = fuelCost + maintenanceCost;

  res.json({
    vehicles: vehicleCounts,
    drivers: driverCounts,
    trips: tripStats,
    costs: {
      fuel_cost: fuelCost,
      maintenance_cost: maintenanceCost,
      total_operational_cost: totalOperationalCost,
    },
    profit: tripStats.total_revenue - totalOperationalCost,
  });
});

// GET /analytics/vehicle/:id — Per-vehicle analytics
router.get("/vehicle/:id", (req, res) => {
  const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  // Trip stats for this vehicle
  const tripStats = db.prepare(`
    SELECT
      COUNT(*) AS total_trips,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_trips,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN revenue ELSE 0 END), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN (end_odometer - start_odometer) ELSE 0 END), 0) AS total_distance
    FROM trips
    WHERE vehicle_id = ?
  `).get(req.params.id);

  // Fuel cost
  const fuelCost = db.prepare(
    "SELECT COALESCE(SUM(cost), 0) AS total, COALESCE(SUM(liters), 0) AS total_liters FROM fuel_logs WHERE vehicle_id = ?"
  ).get(req.params.id);

  // Maintenance cost
  const maintenanceCost = db.prepare(
    "SELECT COALESCE(SUM(cost), 0) AS total FROM maintenance_logs WHERE vehicle_id = ?"
  ).get(req.params.id).total;

  // Operational cost = fuel + maintenance
  const operationalCost = fuelCost.total + maintenanceCost;

  // ROI = (Revenue - Operational Cost) / Acquisition Cost
  const acquisitionCost = vehicle.acquisition_cost || 0;
  const roi = acquisitionCost > 0
    ? Math.round(((tripStats.total_revenue - operationalCost) / acquisitionCost) * 10000) / 100
    : null;

  // Average fuel efficiency
  const avgEfficiency = fuelCost.total_liters > 0
    ? Math.round((tripStats.total_distance / fuelCost.total_liters) * 100) / 100
    : null;

  res.json({
    vehicle,
    trips: tripStats,
    costs: {
      fuel_cost: fuelCost.total,
      fuel_liters: fuelCost.total_liters,
      maintenance_cost: maintenanceCost,
      operational_cost: operationalCost,
    },
    revenue: tripStats.total_revenue,
    profit: tripStats.total_revenue - operationalCost,
    roi_percent: roi,
    avg_fuel_efficiency_km_per_liter: avgEfficiency,
  });
});

module.exports = router;
