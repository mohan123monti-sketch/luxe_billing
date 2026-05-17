import Database from 'better-sqlite3';

const db = new Database('sqlite.db');

// Disable foreign key checks to allow deletion order
db.pragma('foreign_keys = OFF');

// Clear data from tables except products (inventory)
const tables = ['customers', 'bills', 'bill_items', 'users', 'settings'];
for (const table of tables) {
  console.log(`Clearing table: ${table}`);
  db.exec(`DELETE FROM ${table};`);
}

// Re-enable foreign key checks
db.pragma('foreign_keys = ON');

// Vacuum to reclaim space
db.exec('VACUUM;');

db.close();
console.log('Database has been cleared while preserving inventory (products).');
