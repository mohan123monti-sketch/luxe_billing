import { Router } from 'express';
import { db } from '../db/index.ts';
import { bills, products, billItems } from '../db/schema.ts';
import { eq, sql, gte, lte, and } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.ts';
import { startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns';

const router = Router();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    const { start, end } = req.query;
    
    let filterStart = start ? new Date(start as string) : subDays(now, 6);
    let filterEnd = end ? endOfDay(new Date(end as string)) : now;
    
    // Ensure dates are valid, fallback if not
    if (isNaN(filterStart.getTime())) filterStart = subDays(now, 6);
    if (isNaN(filterEnd.getTime())) filterEnd = now;

    // Stats (Global/Standard ones usually stay fixed, but we'll add 'custom' if requested)
    const totalSalesToday = await db.select({ sum: sql<number>`SUM(total_amount)` }).from(bills).where(and(gte(bills.createdAt, todayStart), lte(bills.createdAt, now)));
    const totalSalesWeek = await db.select({ sum: sql<number>`SUM(total_amount)` }).from(bills).where(and(gte(bills.createdAt, weekStart), lte(bills.createdAt, now)));
    const totalSalesMonth = await db.select({ sum: sql<number>`SUM(total_amount)` }).from(bills).where(and(gte(bills.createdAt, monthStart), lte(bills.createdAt, now)));
    
    const totalBills = await db.select({ count: sql<number>`COUNT(*)` }).from(bills);
    const totalProducts = await db.select({ count: sql<number>`COUNT(*)` }).from(products);
    const lowStockItems = await db.select({ count: sql<number>`COUNT(*)` }).from(products).where(sql`stock <= low_stock_threshold`);

    // Dynamic Range logic
    // Generate array of days for the trend
    const daysDiff = Math.max(1, Math.ceil((filterEnd.getTime() - filterStart.getTime()) / (1000 * 60 * 60 * 24)));
    // Cap to 30 days to avoid massive queries, or just do it
    const maxDays = Math.min(daysDiff, 31);
    
    const trendDays = Array.from({ length: maxDays }, (_, i) => {
      const date = new Date(filterEnd.getTime() - (maxDays - 1 - i) * 24 * 60 * 60 * 1000);
      return startOfDay(date);
    });

    const revenueTrend = [];
    for (const day of trendDays) {
      const nextDay = endOfDay(day);
      const result = await db.select({ sum: sql<number>`COALESCE(SUM(total_amount), 0)` }).from(bills).where(and(gte(bills.createdAt, day), lte(bills.createdAt, nextDay)));
      revenueTrend.push({
        date: day.toISOString().split('T')[0],
        revenue: result[0]?.sum || 0,
      });
    }

    // Best Selling Products within range
    const bestSelling = await db.select({
      name: billItems.productName,
      totalQty: sql<number>`SUM(${billItems.quantity})`,
    })
    .from(billItems)
    .innerJoin(bills, eq(billItems.billId, bills.id))
    .where(and(gte(bills.createdAt, filterStart), lte(bills.createdAt, filterEnd)))
    .groupBy(billItems.productName)
    .orderBy(sql`SUM(${billItems.quantity}) DESC`)
    .limit(5);

    // Recent Transactions within range
    const recentTransactions = await db.query.bills.findMany({
      where: and(gte(bills.createdAt, filterStart), lte(bills.createdAt, filterEnd)),
      limit: 10,
      orderBy: (bills, { desc }) => [desc(bills.createdAt)],
    });

    res.json({
      stats: {
        today: totalSalesToday[0]?.sum || 0,
        week: totalSalesWeek[0]?.sum || 0,
        month: totalSalesMonth[0]?.sum || 0,
        totalBills: totalBills[0]?.count || 0,
        totalProducts: totalProducts[0]?.count || 0,
        lowStock: lowStockItems[0]?.count || 0,
      },
      revenueTrend,
      bestSelling,
      recentTransactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
