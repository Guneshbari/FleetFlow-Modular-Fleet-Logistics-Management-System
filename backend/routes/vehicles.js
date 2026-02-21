const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireFields } = require("../middleware/validate");

// Valid statuses for manual updates
const VALID_STATUSES = ["Available", "OnTrip", "InShop", "Retired"];

// GET /vehicles — List all vehicles (supports ?type=Van&status=Available filters)
router.get("/", (req, res) => {
  let query = "SELECT * FROM vehicles WHERE 1=1";
  const params = [];

  if (req.query.type) {
    query += " AND type = ?";
    params.push(req.query.type);
  }
  if (req.query.status) {
    query += " AND status = ?";
    params.push(req.query.status);
  }

  query += " ORDER BY id DESC";
  const vehicles = db.prepare(query).all(...params);
  res.json(vehicles);
});

// GET /vehicles/:id — Get single vehicle
router.get("/:id", (req, res) => {
  const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }
  res.json(vehicle);
});

// POST /vehicles — Create vehicle
router.post("/", requireFields(["model", "license_plate", "max_capacity"]), (req, res) => {
  const { model, type, license_plate, max_capacity, odometer, acquisition_cost } = req.body;

  try {
    const result = db.prepare(
      `INSERT INTO vehicles (model, type, license_plate, max_capacity, odometer, acquisition_cost)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(model, type || 'Truck', license_plate, max_capacity, odometer || 0, acquisition_cost || 0);

    const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(vehicle);
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "License plate already exists" });
    }
    throw err;
  }
});

// PUT /vehicles/:id — Update vehicle
router.put("/:id", (req, res) => {
  const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  const { model, type, license_plate, max_capacity, odometer, acquisition_cost, status } = req.body;

  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
    });
  }

  try {
    db.prepare(
      `UPDATE vehicles SET
        model = COALESCE(?, model),
        type = COALESCE(?, type),
        license_plate = COALESCE(?, license_plate),
        max_capacity = COALESCE(?, max_capacity),
        odometer = COALESCE(?, odometer),
        acquisition_cost = COALESCE(?, acquisition_cost),
        status = COALESCE(?, status)
       WHERE id = ?`
    ).run(
      model || null,
      type || null,
      license_plate || null,
      max_capacity || null,
      odometer != null ? odometer : null,
      acquisition_cost != null ? acquisition_cost : null,
      status || null,
      req.params.id
    );

    const updated = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
    res.json(updated);
  } catch (err) {
    if (err.message.includes("UNIQUE constraint failed")) {
      return res.status(409).json({ error: "License plate already exists" });
    }
    throw err;
  }
});

// DELETE /vehicles/:id — Delete vehicle (only if Available)
router.delete("/:id", (req, res) => {
  const vehicle = db.prepare("SELECT * FROM vehicles WHERE id = ?").get(req.params.id);
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  if (vehicle.status !== "Available") {
    return res.status(400).json({
      error: `Cannot delete vehicle with status '${vehicle.status}'. Must be 'Available'.`,
    });
  }

  db.prepare("DELETE FROM vehicles WHERE id = ?").run(req.params.id);
  res.json({ message: "Vehicle deleted successfully" });
});

module.exports = router;
