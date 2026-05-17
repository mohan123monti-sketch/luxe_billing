import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema.ts';

const dbPath = process.env.DATABASE_PATH || 'sqlite.db';
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on start (simplified for this environment)
// In a real app we'd use drizzle-kit
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    cost_price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 10,
    barcode TEXT UNIQUE,
    discount REAL DEFAULT 0,
    image_url TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE,
    email TEXT,
    address TEXT,
    total_spent REAL DEFAULT 0,
    orders_count INTEGER DEFAULT 0,
    last_visit INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    user_id TEXT NOT NULL,
    subtotal REAL NOT NULL,
    item_discount REAL DEFAULT 0,
    extra_discount REAL DEFAULT 0,
    gst_amount REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'paid',
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price REAL NOT NULL,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY,
    shop_name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    gst_number TEXT,
    gst_rate REAL DEFAULT 0,
    currency_symbol TEXT DEFAULT '$',
    receipt_footer TEXT,
    logo_url TEXT,
    updated_at INTEGER NOT NULL
  );
`);

// Seed Admin User and Initial Settings
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
  const existingUsers = sqlite.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (existingUsers.count === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    sqlite.prepare('INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
      'admin-uuid',
      'Admin',
      'admin@pos.com',
      hashedPassword,
      'admin',
      Date.now()
    );
    console.log('Seeded admin user: admin@pos.com / admin123');
  }

  const existingSettings = sqlite.prepare('SELECT count(*) as count FROM settings').get() as { count: number };
  if (existingSettings.count === 0) {
    sqlite.prepare('INSERT INTO settings (id, shop_name, address, phone, gst_number, gst_rate, currency_symbol, receipt_footer, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      1,
      'LUXE Apparel',
      '45 Fashion Avenue, Boutique District, NY 10012',
      '+1 (212) 555-8899',
      'GSTIN 74108520',
      12,
      '₹',
      'Thank you for shopping with us!',
      Date.now()
    );
    console.log('Seeded initial settings for LUXE Apparel');
  }

  const existingProducts = sqlite.prepare('SELECT count(*) as count FROM products').get() as { count: number };
  if (existingProducts.count === 0) {
    const sampleProducts = [
      { id: 'LUX-001', name: 'Premium Linen Shirt', category: 'Shirts', price: 2499.00, costPrice: 1200.00, stock: 45, barcode: '890123456001' },
      { id: 'LUX-002', name: 'Slim Fit Denim Jeans', category: 'Pants', price: 3999.00, costPrice: 1800.00, stock: 30, barcode: '890123456002' },
      { id: 'LUX-003', name: 'Cotton Summer Dress', category: 'Dresses', price: 4500.00, costPrice: 2000.00, stock: 20, barcode: '890123456003' },
      { id: 'LUX-004', name: 'Silk Evening Scarf', category: 'Accessories', price: 1200.00, costPrice: 500.00, stock: 15, barcode: '890123456004' },
      { id: 'LUX-005', name: 'Leather Belt', category: 'Accessories', price: 1800.00, costPrice: 800.00, stock: 50, barcode: '890123456005' },
      { id: 'LUX-006', name: 'Woolen Overcoat', category: 'Outerwear', price: 8999.00, costPrice: 4500.00, stock: 10, barcode: '890123456006' },
    ];

    const insert = sqlite.prepare('INSERT INTO products (id, name, category, price, cost_price, stock, barcode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    for (const p of sampleProducts) {
      insert.run(p.id, p.name, p.category, p.price, p.costPrice, p.stock, p.barcode, Date.now(), Date.now());
    }
    console.log('Seeded clothing products');
  }

  const existingCustomers = sqlite.prepare('SELECT count(*) as count FROM customers').get() as { count: number };
  if (existingCustomers.count === 0) {
    sqlite.prepare('INSERT INTO customers (id, name, phone, email, address, total_spent, orders_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      uuidv4(),
      'John Wick',
      '+1 555 0199',
      'john@continental.com',
      'The Continental Hotel, NYC',
      2500.50,
      12,
      Date.now()
    );
    console.log('Seeded sample customer');
  }
}
seed().catch(console.error);
