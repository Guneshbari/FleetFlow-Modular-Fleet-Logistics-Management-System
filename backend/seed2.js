const db = require('./db');
try {
  db.exec(`
    INSERT INTO regions (name) VALUES ('North'), ('South');
    INSERT INTO users (name, email, role) VALUES ('Alice', 'alice@test.com', 'Manager'), ('Bob', 'bob@test.com', 'Dispatcher');
  `);
  console.log('Seeded successfully with seed2.js!');
} catch (e) {
  console.error(e.message);
}
