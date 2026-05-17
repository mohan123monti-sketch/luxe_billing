import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('sqlite.db');

// Add default admin user
const adminId = uuidv4();
const adminEmail = 'admin@pos.com';
const adminPassword = await bcrypt.hash('admin123', 10);
const now = new Date().getTime();

try {
  db.exec(`
    INSERT INTO users (id, name, email, password, role, created_at)
    VALUES ('${adminId}', 'Admin', '${adminEmail}', '${adminPassword}', 'admin', ${now})
  `);
  console.log('Admin user seeded (admin@pos.com / admin123).');
} catch (e) {
  console.log('Admin user might already exist.', e.message);
}

// Add default settings
try {
  db.exec(`
    INSERT INTO settings (id, shop_name, address, phone, gst_number, gst_rate, currency_symbol, receipt_footer, updated_at)
    VALUES (1, 'LUXE', '123 Main St', '+1234567890', 'GST12345', 12, '₹', 'Thank you!', ${now})
  `);
  console.log('Default settings seeded.');
} catch (e) {
  console.log('Settings might already exist.', e.message);
}

db.close();
