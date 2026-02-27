-- FleetFlow Schema with CHECK constraints and timestamps

CREATE TABLE IF NOT EXISTS regions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('Super Admin', 'Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst', 'Driver')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  permission TEXT NOT NULL,
  granted_by INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(granted_by) REFERENCES users(id),
  UNIQUE(user_id, permission)
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model TEXT NOT NULL,
  type TEXT DEFAULT 'Truck' CHECK(type IN ('Truck', 'Van', 'Bike', 'Car', 'Other')),
  license_plate TEXT UNIQUE NOT NULL,
  max_capacity REAL NOT NULL,
  odometer REAL DEFAULT 0,
  acquisition_cost REAL DEFAULT 0,
  status TEXT DEFAULT 'Available' CHECK(status IN ('Available', 'OnTrip', 'InShop', 'Retired')),
  region_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(region_id) REFERENCES regions(id)
);

CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  license_type TEXT,
  license_expiry TEXT,
  status TEXT DEFAULT 'OnDuty' CHECK(status IN ('OnDuty', 'OffDuty', 'OnTrip', 'Suspended')),
  region_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(region_id) REFERENCES regions(id)
);

CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  driver_id INTEGER NOT NULL,
  cargo_weight REAL,
  start_location TEXT,
  end_location TEXT,
  start_odometer REAL,
  end_odometer REAL,
  revenue REAL DEFAULT 0,
  status TEXT DEFAULT 'Draft' CHECK(status IN ('Draft', 'Dispatched', 'Completed', 'Cancelled')),
  origin_region_id INTEGER,
  destination_region_id INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY(driver_id) REFERENCES drivers(id),
  FOREIGN KEY(origin_region_id) REFERENCES regions(id),
  FOREIGN KEY(destination_region_id) REFERENCES regions(id)
);

CREATE TABLE IF NOT EXISTS fuel_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  trip_id INTEGER,
  liters REAL NOT NULL,
  cost REAL NOT NULL,
  odometer_reading REAL,
  efficiency REAL,
  date TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY(trip_id) REFERENCES trips(id)
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  cost REAL NOT NULL,
  date TEXT DEFAULT (date('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
);