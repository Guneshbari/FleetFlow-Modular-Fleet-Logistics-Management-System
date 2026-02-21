const express = require("express");
const router = express.Router();
const db = require("../db");

// GET /analytics/summary — Fleet-wide analytics with all KPIs
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

  // Utilization Rate: % of fleet assigned (OnTrip) vs total non-retired
  const activeFleet = vehicleCounts.total_vehicles - (vehicleCounts.retired || 0);
  const utilizationRate = activeFleet > 0
    ? Math.round(((vehicleCounts.on_trip || 0) / activeFleet) * 10000) / 100
    : 0;

  // Total drivers by status
  const driverCounts = db.prepare(`
    SELECT
      COUNT(*) AS total_drivers,
      SUM(CASE WHEN status = 'OnDuty' THEN 1 ELSE 0 END) AS on_duty,
      SUM(CASE WHEN status = 'OffDuty' THEN 1 ELSE 0 END) AS off_duty,
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

  // Pending Cargo: trips waiting for assignment (Draft status)
  const pendingCargo = tripStats.draft || 0;

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
    kpis: {
      active_fleet: vehicleCounts.on_trip || 0,
      maintenance_alerts: vehicleCounts.in_shop || 0,
      utilization_rate_percent: utilizationRate,
      pending_cargo: pendingCargo,
    },
    costs: {
      fuel_cost: fuelCost,
      maintenance_cost: maintenanceCost,
      total_operational_cost: totalOperationalCost,
    },
    profit: tripStats.total_revenue - totalOperationalCost,
  });
});

// GET /analytics/vehicle/:id — Per-vehicle analytics with cost-per-km
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
  const fuelData = db.prepare(
    "SELECT COALESCE(SUM(cost), 0) AS total, COALESCE(SUM(liters), 0) AS total_liters FROM fuel_logs WHERE vehicle_id = ?"
  ).get(req.params.id);

  // Maintenance cost
  const maintenanceCost = db.prepare(
    "SELECT COALESCE(SUM(cost), 0) AS total FROM maintenance_logs WHERE vehicle_id = ?"
  ).get(req.params.id).total;

  // Operational cost = fuel + maintenance
  const operationalCost = fuelData.total + maintenanceCost;

  // ROI = (Revenue - Operational Cost) / Acquisition Cost
  const acquisitionCost = vehicle.acquisition_cost || 0;
  const roi = acquisitionCost > 0
    ? Math.round(((tripStats.total_revenue - operationalCost) / acquisitionCost) * 10000) / 100
    : null;

  // Average fuel efficiency (km/L)
  const avgEfficiency = fuelData.total_liters > 0
    ? Math.round((tripStats.total_distance / fuelData.total_liters) * 100) / 100
    : null;

  // Cost per km
  const costPerKm = tripStats.total_distance > 0
    ? Math.round((operationalCost / tripStats.total_distance) * 100) / 100
    : null;

  res.json({
    vehicle,
    trips: tripStats,
    costs: {
      fuel_cost: fuelData.total,
      fuel_liters: fuelData.total_liters,
      maintenance_cost: maintenanceCost,
      operational_cost: operationalCost,
    },
    revenue: tripStats.total_revenue,
    profit: tripStats.total_revenue - operationalCost,
    roi_percent: roi,
    avg_fuel_efficiency_km_per_liter: avgEfficiency,
    cost_per_km: costPerKm,
  });
});

// GET /analytics/driver/:id — Per-driver analytics
router.get("/driver/:id", (req, res) => {
  const driver = db.prepare("SELECT * FROM drivers WHERE id = ?").get(req.params.id);
  if (!driver) {
    return res.status(404).json({ error: "Driver not found" });
  }

  // Trip stats for this driver
  const tripStats = db.prepare(`
    SELECT
      COUNT(*) AS total_trips,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_trips,
      SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_trips,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN revenue ELSE 0 END), 0) AS total_revenue,
      COALESCE(SUM(CASE WHEN status = 'Completed' THEN (end_odometer - start_odometer) ELSE 0 END), 0) AS total_distance
    FROM trips
    WHERE driver_id = ?
  `).get(req.params.id);

  // Completion rate
  const completionRate = tripStats.total_trips > 0
    ? Math.round(((tripStats.completed_trips || 0) / tripStats.total_trips) * 10000) / 100
    : 0;

  // Safety score: simple heuristic (100 - cancellation penalty)
  // Each cancellation reduces score by 5 points, min 0
  const cancellationPenalty = (tripStats.cancelled_trips || 0) * 5;
  const safetyScore = Math.max(0, 100 - cancellationPenalty);

  // License status
  const today = new Date().toISOString().split("T")[0];
  const licenseValid = driver.license_expiry ? driver.license_expiry >= today : false;

  res.json({
    driver,
    trips: tripStats,
    performance: {
      completion_rate_percent: completionRate,
      safety_score: safetyScore,
      total_distance_km: tripStats.total_distance,
      total_revenue: tripStats.total_revenue,
    },
    compliance: {
      license_valid: licenseValid,
      license_expiry: driver.license_expiry,
    },
  });
});

// GET /analytics/export — CSV export of fleet data
router.get("/export", (req, res) => {
  // Vehicle report with operational cost summary
  const vehicles = db.prepare("SELECT * FROM vehicles ORDER BY id").all();

  const rows = vehicles.map((v) => {
    const fuelCost = db.prepare(
      "SELECT COALESCE(SUM(cost), 0) AS total FROM fuel_logs WHERE vehicle_id = ?"
    ).get(v.id).total;

    const maintenanceCost = db.prepare(
      "SELECT COALESCE(SUM(cost), 0) AS total FROM maintenance_logs WHERE vehicle_id = ?"
    ).get(v.id).total;

    const tripData = db.prepare(`
      SELECT
        COUNT(*) AS total_trips,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN revenue ELSE 0 END), 0) AS revenue,
        COALESCE(SUM(CASE WHEN status = 'Completed' THEN (end_odometer - start_odometer) ELSE 0 END), 0) AS distance
      FROM trips WHERE vehicle_id = ?
    `).get(v.id);

    const operationalCost = fuelCost + maintenanceCost;
    const roi = v.acquisition_cost > 0
      ? Math.round(((tripData.revenue - operationalCost) / v.acquisition_cost) * 10000) / 100
      : "N/A";

    return {
      id: v.id,
      model: v.model,
      type: v.type,
      license_plate: v.license_plate,
      status: v.status,
      odometer: v.odometer,
      total_trips: tripData.total_trips,
      total_distance_km: tripData.distance,
      revenue: tripData.revenue,
      fuel_cost: fuelCost,
      maintenance_cost: maintenanceCost,
      operational_cost: operationalCost,
      profit: tripData.revenue - operationalCost,
      roi_percent: roi,
    };
  });

  // Generate CSV
  if (rows.length === 0) {
    return res.status(200).send("No vehicles found");
  }

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => `"${row[h]}"`).join(",")),
  ];
  const csv = csvLines.join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=fleetflow_report.csv");
  res.send(csv);
});

module.exports = router;
