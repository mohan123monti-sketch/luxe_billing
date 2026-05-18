var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

// server/routes/auth.ts
import { Router } from "express";
import bcrypt2 from "bcryptjs";
import jwt from "jsonwebtoken";

// server/db/index.ts
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// server/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  billItems: () => billItems,
  billItemsRelations: () => billItemsRelations,
  bills: () => bills,
  billsRelations: () => billsRelations,
  customers: () => customers,
  customersRelations: () => customersRelations,
  products: () => products,
  settings: () => settings,
  users: () => users
});
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
var users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "staff"] }).default("staff"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull()
});
var products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  price: real("price").notNull(),
  costPrice: real("cost_price").notNull(),
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  barcode: text("barcode").unique(),
  discount: real("discount").default(0),
  imageUrl: text("image_url"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});
var customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").unique(),
  email: text("email"),
  address: text("address"),
  totalSpent: real("total_spent").default(0),
  ordersCount: integer("orders_count").default(0),
  lastVisit: integer("last_visit", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull()
});
var bills = sqliteTable("bills", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customers.id),
  userId: text("user_id").notNull().references(() => users.id),
  subtotal: real("subtotal").notNull(),
  itemDiscount: real("item_discount").default(0),
  extraDiscount: real("extra_discount").default(0),
  gstAmount: real("gst_amount").default(0),
  totalAmount: real("total_amount").notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "upi"] }).notNull(),
  status: text("status", { enum: ["paid", "pending", "cancelled"] }).default("paid"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull()
});
var billItems = sqliteTable("bill_items", {
  id: text("id").primaryKey(),
  billId: text("bill_id").notNull().references(() => bills.id),
  productId: text("product_id").notNull().references(() => products.id),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  discount: real("discount").default(0),
  total: real("total").notNull()
});
var settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  shopName: text("shop_name").notNull(),
  address: text("address"),
  phone: text("phone"),
  gstNumber: text("gst_number"),
  gstRate: real("gst_rate").default(0),
  currencySymbol: text("currency_symbol").default("$"),
  receiptFooter: text("receipt_footer"),
  logoUrl: text("logo_url"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull()
});
var billsRelations = relations(bills, ({ one, many }) => ({
  customer: one(customers, {
    fields: [bills.customerId],
    references: [customers.id]
  }),
  user: one(users, {
    fields: [bills.userId],
    references: [users.id]
  }),
  billItems: many(billItems)
}));
var billItemsRelations = relations(billItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id]
  }),
  product: one(products, {
    fields: [billItems.productId],
    references: [products.id]
  })
}));
var customersRelations = relations(customers, ({ many }) => ({
  bills: many(bills)
}));

// server/db/index.ts
import bcrypt from "bcryptjs";

// node_modules/uuid/dist-node/stringify.js
var byteToHex = [];
for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// node_modules/uuid/dist-node/rng.js
var rnds8 = new Uint8Array(16);
function rng() {
  return crypto.getRandomValues(rnds8);
}

// node_modules/uuid/dist-node/v4.js
function v4(options, buf, offset) {
  if (!buf && !options && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return _v4(options, buf, offset);
}
function _v4(options, buf, offset) {
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// server/db/index.ts
var dbPath = process.env.DATABASE_PATH || "sqlite.db";
var sqlite = new Database(dbPath);
var db = drizzle(sqlite, { schema: schema_exports });
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
async function seed() {
  const existingUsers = sqlite.prepare("SELECT count(*) as count FROM users").get();
  if (existingUsers.count === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    sqlite.prepare("INSERT INTO users (id, name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
      "admin-uuid",
      "Admin",
      "admin@pos.com",
      hashedPassword,
      "admin",
      Date.now()
    );
    console.log("Seeded admin user: admin@pos.com / admin123");
  }
  const existingSettings = sqlite.prepare("SELECT count(*) as count FROM settings").get();
  if (existingSettings.count === 0) {
    sqlite.prepare("INSERT INTO settings (id, shop_name, address, phone, gst_number, gst_rate, currency_symbol, receipt_footer, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      1,
      "LUXE Apparel",
      "45 Fashion Avenue, Boutique District, NY 10012",
      "+1 (212) 555-8899",
      "GSTIN 74108520",
      12,
      "\u20B9",
      "Thank you for shopping with us!",
      Date.now()
    );
    console.log("Seeded initial settings for LUXE Apparel");
  }
  const existingProducts = sqlite.prepare("SELECT count(*) as count FROM products").get();
  if (existingProducts.count === 0) {
    const sampleProducts = [
      { id: "LUX-001", name: "Premium Linen Shirt", category: "Shirts", price: 2499, costPrice: 1200, stock: 45, barcode: "890123456001" },
      { id: "LUX-002", name: "Slim Fit Denim Jeans", category: "Pants", price: 3999, costPrice: 1800, stock: 30, barcode: "890123456002" },
      { id: "LUX-003", name: "Cotton Summer Dress", category: "Dresses", price: 4500, costPrice: 2e3, stock: 20, barcode: "890123456003" },
      { id: "LUX-004", name: "Silk Evening Scarf", category: "Accessories", price: 1200, costPrice: 500, stock: 15, barcode: "890123456004" },
      { id: "LUX-005", name: "Leather Belt", category: "Accessories", price: 1800, costPrice: 800, stock: 50, barcode: "890123456005" },
      { id: "LUX-006", name: "Woolen Overcoat", category: "Outerwear", price: 8999, costPrice: 4500, stock: 10, barcode: "890123456006" }
    ];
    const insert = sqlite.prepare("INSERT INTO products (id, name, category, price, cost_price, stock, barcode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    for (const p of sampleProducts) {
      insert.run(p.id, p.name, p.category, p.price, p.costPrice, p.stock, p.barcode, Date.now(), Date.now());
    }
    console.log("Seeded clothing products");
  }
  const existingCustomers = sqlite.prepare("SELECT count(*) as count FROM customers").get();
  if (existingCustomers.count === 0) {
    sqlite.prepare("INSERT INTO customers (id, name, phone, email, address, total_spent, orders_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(
      v4_default(),
      "John Wick",
      "+1 555 0199",
      "john@continental.com",
      "The Continental Hotel, NYC",
      2500.5,
      12,
      Date.now()
    );
    console.log("Seeded sample customer");
  }
}
seed().catch(console.error);

// server/routes/auth.ts
import { eq } from "drizzle-orm";
var router = Router();
var JWT_SECRET = process.env.JWT_SECRET || "super-secret-pos-key";
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email)
    });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = await bcrypt2.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
var auth_default = router;

// server/routes/products.ts
import { Router as Router2 } from "express";
import { eq as eq2, like, or } from "drizzle-orm";

// server/middleware/auth.ts
var JWT_SECRET2 = process.env.JWT_SECRET || "super-secret-pos-key";
var authenticate = (req, res, next) => {
  req.user = { id: "admin-uuid", role: "admin" };
  next();
};

// server/routes/products.ts
var router2 = Router2();
router2.get("/", authenticate, async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await db.query.products.findMany({
        where: or(
          like(products.name, `%${search}%`),
          like(products.barcode, `%${search}%`),
          like(products.id, `%${search}%`)
        )
      });
    } else {
      result = await db.query.products.findMany();
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router2.post("/", authenticate, async (req, res) => {
  try {
    const id = req.body.id || v4_default().slice(0, 8).toUpperCase();
    const newProduct = {
      ...req.body,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (newProduct.barcode === "") delete newProduct.barcode;
    await db.insert(products).values(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router2.put("/:id", authenticate, async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...updateData } = req.body;
    const newId = id || v4_default().slice(0, 8).toUpperCase();
    const finalUpdate = {
      ...updateData,
      id: newId,
      updatedAt: /* @__PURE__ */ new Date()
    };
    await db.update(products).set(finalUpdate).where(eq2(products.id, req.params.id));
    res.json({ id: req.params.id, ...finalUpdate });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});
router2.delete("/:id", authenticate, async (req, res) => {
  try {
    await db.delete(products).where(eq2(products.id, req.params.id));
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
var products_default = router2;

// server/routes/customers.ts
import { Router as Router3 } from "express";
import { like as like2, or as or2 } from "drizzle-orm";
var router3 = Router3();
router3.get("/", authenticate, async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await db.query.customers.findMany({
        where: or2(
          like2(customers.name, `%${search}%`),
          like2(customers.phone, `%${search}%`)
        ),
        with: {
          bills: {
            with: {
              billItems: true
            }
          }
        }
      });
    } else {
      result = await db.query.customers.findMany({
        with: {
          bills: {
            with: {
              billItems: true
            }
          }
        }
      });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router3.post("/", authenticate, async (req, res) => {
  try {
    const id = v4_default();
    const newCustomer = {
      ...req.body,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(customers).values(newCustomer);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
var customers_default = router3;

// server/routes/bills.ts
import { Router as Router4 } from "express";
import { eq as eq4, sql } from "drizzle-orm";
var router4 = Router4();
router4.get("/", authenticate, async (req, res) => {
  try {
    const result = await db.query.bills.findMany({
      with: {
        billItems: true
      },
      orderBy: (bills2, { desc }) => [desc(bills2.createdAt)]
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router4.post("/", authenticate, async (req, res) => {
  const { customerId: bodyCustomerId, customerName, customerPhone, items, paymentMethod, subtotal, itemDiscount, extraDiscount, gstAmount, totalAmount, notes } = req.body;
  const userId = req.user?.id || "admin-uuid";
  try {
    let customerId = bodyCustomerId;
    if (!customerId && (customerPhone || customerName)) {
      let existingCustomer;
      if (customerPhone) {
        existingCustomer = await db.query.customers.findFirst({
          where: eq4(customers.phone, customerPhone)
        });
      }
      if (existingCustomer) {
        customerId = existingCustomer.id;
        if (customerName && existingCustomer.name !== customerName) {
          await db.update(customers).set({ name: customerName }).where(eq4(customers.id, existingCustomer.id));
        }
      } else {
        customerId = v4_default();
        await db.insert(customers).values({
          id: customerId,
          name: customerName || "Unknown Customer",
          phone: customerPhone || null,
          totalSpent: 0,
          ordersCount: 0,
          createdAt: /* @__PURE__ */ new Date()
        });
      }
    }
    const billId = `INV-${Date.now()}`;
    await db.insert(bills).values({
      id: billId,
      customerId,
      userId,
      subtotal,
      itemDiscount,
      extraDiscount,
      gstAmount,
      totalAmount,
      paymentMethod,
      notes,
      createdAt: /* @__PURE__ */ new Date()
    });
    for (const item of items) {
      await db.insert(billItems).values({
        id: v4_default(),
        billId,
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount,
        total: item.total
      });
      await db.update(products).set({ stock: sql`stock - ${item.quantity}` }).where(eq4(products.id, item.productId));
    }
    if (customerId) {
      await db.update(customers).set({
        totalSpent: sql`total_spent + ${totalAmount}`,
        ordersCount: sql`orders_count + 1`,
        lastVisit: /* @__PURE__ */ new Date()
      }).where(eq4(customers.id, customerId));
    }
    res.status(201).json({ id: billId, message: "Bill generated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
var bills_default = router4;

// server/routes/settings.ts
import { Router as Router5 } from "express";
import { eq as eq5 } from "drizzle-orm";
var router5 = Router5();
router5.get("/", async (req, res) => {
  try {
    const result = await db.query.settings.findFirst({
      where: eq5(settings.id, 1)
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router5.put("/", authenticate, async (req, res) => {
  try {
    const updatedSettings = {
      ...req.body,
      updatedAt: /* @__PURE__ */ new Date()
    };
    delete updatedSettings.id;
    await db.update(settings).set(updatedSettings).where(eq5(settings.id, 1));
    res.json({ id: 1, ...updatedSettings });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});
router5.delete("/clear-data", authenticate, async (req, res) => {
  try {
    db.delete(billItems).run();
    db.delete(bills).run();
    db.delete(customers).run();
    res.json({ message: "Shopping data cleared successfully" });
  } catch (error) {
    console.error("Error clearing data:", error);
    res.status(500).json({ error: "Failed to clear data" });
  }
});
var settings_default = router5;

// server/routes/reports.ts
import { Router as Router6 } from "express";
import { eq as eq6, sql as sql2, gte, lte, and } from "drizzle-orm";

// node_modules/date-fns/constants.js
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;
var constructFromSymbol = Symbol.for("constructDateFrom");

// node_modules/date-fns/constructFrom.js
function constructFrom(date, value) {
  if (typeof date === "function") return date(value);
  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);
  if (date instanceof Date) return new date.constructor(value);
  return new Date(value);
}

// node_modules/date-fns/toDate.js
function toDate(argument, context) {
  return constructFrom(context || argument, argument);
}

// node_modules/date-fns/addDays.js
function addDays(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
  if (!amount) return _date;
  _date.setDate(_date.getDate() + amount);
  return _date;
}

// node_modules/date-fns/_lib/defaultOptions.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/date-fns/startOfWeek.js
function startOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/startOfDay.js
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/endOfDay.js
function endOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(23, 59, 59, 999);
  return _date;
}

// node_modules/date-fns/startOfMonth.js
function startOfMonth(date, options) {
  const _date = toDate(date, options?.in);
  _date.setDate(1);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/date-fns/subDays.js
function subDays(date, amount, options) {
  return addDays(date, -amount, options);
}

// server/routes/reports.ts
var router6 = Router6();
router6.get("/dashboard", authenticate, async (req, res) => {
  try {
    const now = /* @__PURE__ */ new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const { start, end } = req.query;
    let filterStart = start ? new Date(start) : subDays(now, 6);
    let filterEnd = end ? endOfDay(new Date(end)) : now;
    if (isNaN(filterStart.getTime())) filterStart = subDays(now, 6);
    if (isNaN(filterEnd.getTime())) filterEnd = now;
    const totalSalesToday = await db.select({ sum: sql2`SUM(total_amount)` }).from(bills).where(and(gte(bills.createdAt, todayStart), lte(bills.createdAt, now)));
    const totalSalesWeek = await db.select({ sum: sql2`SUM(total_amount)` }).from(bills).where(and(gte(bills.createdAt, weekStart), lte(bills.createdAt, now)));
    const totalSalesMonth = await db.select({ sum: sql2`SUM(total_amount)` }).from(bills).where(and(gte(bills.createdAt, monthStart), lte(bills.createdAt, now)));
    const totalBills = await db.select({ count: sql2`COUNT(*)` }).from(bills);
    const totalProducts = await db.select({ count: sql2`COUNT(*)` }).from(products);
    const lowStockItems = await db.select({ count: sql2`COUNT(*)` }).from(products).where(sql2`stock <= low_stock_threshold`);
    const daysDiff = Math.max(1, Math.ceil((filterEnd.getTime() - filterStart.getTime()) / (1e3 * 60 * 60 * 24)));
    const maxDays = Math.min(daysDiff, 31);
    const trendDays = Array.from({ length: maxDays }, (_, i) => {
      const date = new Date(filterEnd.getTime() - (maxDays - 1 - i) * 24 * 60 * 60 * 1e3);
      return startOfDay(date);
    });
    const revenueTrend = [];
    for (const day of trendDays) {
      const nextDay = endOfDay(day);
      const result = await db.select({ sum: sql2`COALESCE(SUM(total_amount), 0)` }).from(bills).where(and(gte(bills.createdAt, day), lte(bills.createdAt, nextDay)));
      revenueTrend.push({
        date: day.toISOString().split("T")[0],
        revenue: result[0]?.sum || 0
      });
    }
    const bestSelling = await db.select({
      name: billItems.productName,
      totalQty: sql2`SUM(${billItems.quantity})`
    }).from(billItems).innerJoin(bills, eq6(billItems.billId, bills.id)).where(and(gte(bills.createdAt, filterStart), lte(bills.createdAt, filterEnd))).groupBy(billItems.productName).orderBy(sql2`SUM(${billItems.quantity}) DESC`).limit(5);
    const recentTransactions = await db.query.bills.findMany({
      where: and(gte(bills.createdAt, filterStart), lte(bills.createdAt, filterEnd)),
      limit: 10,
      orderBy: (bills2, { desc }) => [desc(bills2.createdAt)]
    });
    res.json({
      stats: {
        today: totalSalesToday[0]?.sum || 0,
        week: totalSalesWeek[0]?.sum || 0,
        month: totalSalesMonth[0]?.sum || 0,
        totalBills: totalBills[0]?.count || 0,
        totalProducts: totalProducts[0]?.count || 0,
        lowStock: lowStockItems[0]?.count || 0
      },
      revenueTrend,
      bestSelling,
      recentTransactions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
var reports_default = router6;

// server/index.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3e3;
  const isProd = process.env.NODE_ENV === "production";
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json());
  app.use("/api/auth", auth_default);
  app.use("/api/products", products_default);
  app.use("/api/customers", customers_default);
  app.use("/api/bills", bills_default);
  app.use("/api/settings", settings_default);
  app.use("/api/reports", reports_default);
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom"
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await vite.transformIndexHtml(url, `
          <!doctype html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>Industrial POS</title>
            </head>
            <body>
              <div id="root"></div>
              <script type="module" src="/src/main.tsx"></script>
            </body>
          </html>
        `);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.join(__dirname, "../dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (${isProd ? "PRODUCTION" : "DEVELOPMENT"})`);
  });
}
startServer().catch(console.error);
