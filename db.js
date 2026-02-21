const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

// Create DB file in database folder
const dbPath = path.join(__dirname, "database", "fleetflow.db");

// Initialize DB
const db = new Database(dbPath);

// Enable foreign key enforcement
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Load and run schema
const schemaPath = path.join(__dirname, "database", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

db.exec(schema);

console.log("Database initialized with foreign keys enabled.");

module.exports = db;