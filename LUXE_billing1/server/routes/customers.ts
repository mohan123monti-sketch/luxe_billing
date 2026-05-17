import { Router } from 'express';
import { db } from '../db/index.ts';
import { customers } from '../db/schema.ts';
import { eq, like, or } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.ts';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await db.query.customers.findMany({
        where: or(
          like(customers.name, `%${search}%`),
          like(customers.phone, `%${search}%`)
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
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const id = uuidv4();
    const newCustomer = {
      ...req.body,
      id,
      createdAt: new Date(),
    };
    await db.insert(customers).values(newCustomer);
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
