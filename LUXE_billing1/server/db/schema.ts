import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['admin', 'staff'] }).default('staff'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  price: real('price').notNull(),
  costPrice: real('cost_price').notNull(),
  stock: integer('stock').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
  barcode: text('barcode').unique(),
  discount: real('discount').default(0),
  imageUrl: text('image_url'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const customers = sqliteTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone').unique(),
  email: text('email'),
  address: text('address'),
  totalSpent: real('total_spent').default(0),
  ordersCount: integer('orders_count').default(0),
  lastVisit: integer('last_visit', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const bills = sqliteTable('bills', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').references(() => customers.id),
  userId: text('user_id').notNull().references(() => users.id),
  subtotal: real('subtotal').notNull(),
  itemDiscount: real('item_discount').default(0),
  extraDiscount: real('extra_discount').default(0),
  gstAmount: real('gst_amount').default(0),
  totalAmount: real('total_amount').notNull(),
  paymentMethod: text('payment_method', { enum: ['cash', 'card', 'upi'] }).notNull(),
  status: text('status', { enum: ['paid', 'pending', 'cancelled'] }).default('paid'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const billItems = sqliteTable('bill_items', {
  id: text('id').primaryKey(),
  billId: text('bill_id').notNull().references(() => bills.id),
  productId: text('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  discount: real('discount').default(0),
  total: real('total').notNull(),
});

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),
  shopName: text('shop_name').notNull(),
  address: text('address'),
  phone: text('phone'),
  gstNumber: text('gst_number'),
  gstRate: real('gst_rate').default(0),
  currencySymbol: text('currency_symbol').default('$'),
  receiptFooter: text('receipt_footer'),
  logoUrl: text('logo_url'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const billsRelations = relations(bills, ({ one, many }) => ({
  customer: one(customers, {
    fields: [bills.customerId],
    references: [customers.id],
  }),
  user: one(users, {
    fields: [bills.userId],
    references: [users.id],
  }),
  billItems: many(billItems),
}));

export const billItemsRelations = relations(billItems, ({ one }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id],
  }),
  product: one(products, {
    fields: [billItems.productId],
    references: [products.id],
  }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  bills: many(bills),
}));
