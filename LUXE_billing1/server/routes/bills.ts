import { Router } from 'express';
import { db } from '../db/index.ts';
import { bills, billItems, products, customers } from '../db/schema.ts';
import { eq, sql } from 'drizzle-orm';
import { authenticate, AuthRequest } from '../middleware/auth.ts';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const result = await db.query.bills.findMany({
      with: {
        billItems: true,
      },
      orderBy: (bills, { desc }) => [desc(bills.createdAt)],
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { customerId: bodyCustomerId, customerName, customerPhone, items, paymentMethod, subtotal, itemDiscount, extraDiscount, gstAmount, totalAmount, notes } = req.body;
  const userId = req.user?.id || 'admin-uuid';

  try {
    let customerId = bodyCustomerId;

    if (!customerId && (customerPhone || customerName)) {
      let existingCustomer;
      if (customerPhone) {
        existingCustomer = await db.query.customers.findFirst({
          where: eq(customers.phone, customerPhone),
        });
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
        // Optionally update the name if provided
        if (customerName && existingCustomer.name !== customerName) {
           await db.update(customers).set({ name: customerName }).where(eq(customers.id, existingCustomer.id));
        }
      } else {
        customerId = uuidv4();
        await db.insert(customers).values({
          id: customerId,
          name: customerName || 'Unknown Customer',
          phone: customerPhone || null,
          totalSpent: 0,
          ordersCount: 0,
          createdAt: new Date(),
        });
      }
    }

    const billId = `INV-${Date.now()}`;
    
    // 1. Create the bill
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
      createdAt: new Date(),
    });

    // 2. Add items and update stock
    for (const item of items) {
      await db.insert(billItems).values({
        id: uuidv4(),
        billId,
        productId: item.productId,
        productName: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount,
        total: item.total,
      });

      // Update stock
      await db.update(products)
        .set({ stock: sql`stock - ${item.quantity}` })
        .where(eq(products.id, item.productId));
    }

    // 3. Update customer stats if applicable
    if (customerId) {
      await db.update(customers)
        .set({
          totalSpent: sql`total_spent + ${totalAmount}`,
          ordersCount: sql`orders_count + 1`,
          lastVisit: new Date(),
        })
        .where(eq(customers.id, customerId));
    }

    res.status(201).json({ id: billId, message: 'Bill generated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
