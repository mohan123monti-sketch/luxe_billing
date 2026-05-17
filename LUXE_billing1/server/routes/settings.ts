import { Router } from 'express';
import { db } from '../db/index.ts';
import { settings, bills, billItems, customers } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const result = await db.query.settings.findFirst({
      where: eq(settings.id, 1),
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/', authenticate, async (req, res) => {
  try {
    const updatedSettings = {
      ...req.body,
      updatedAt: new Date(),
    };
    delete updatedSettings.id;
    await db.update(settings).set(updatedSettings).where(eq(settings.id, 1));
    res.json({ id: 1, ...updatedSettings });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/clear-data', authenticate, async (req, res) => {
  try {
    // Execute the deletes. better-sqlite3 handles this synchronously but drizzle wrappers usually provide .run()
    db.delete(billItems).run();
    db.delete(bills).run();
    db.delete(customers).run();
    
    res.json({ message: 'Shopping data cleared successfully' });
  } catch (error) {
    console.error('Error clearing data:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

export default router;
