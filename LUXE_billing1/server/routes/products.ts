import { Router } from 'express';
import { db } from '../db/index.ts';
import { products } from '../db/schema.ts';
import { eq, like, or } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.ts';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', authenticate, async (req, res) => {
  const { search } = req.query;
  try {
    let result;
    if (search) {
      result = await db.query.products.findMany({
        where: or(
          like(products.name, `%${search}%`),
          like(products.barcode, `%${search}%`),
          like(products.id, `%${search}%`)
        ),
      });
    } else {
      result = await db.query.products.findMany();
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const id = req.body.id || uuidv4().slice(0, 8).toUpperCase();
    const newProduct = {
      ...req.body,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Remove barcode if it's empty to avoid issues, or delete if not needed
    if (newProduct.barcode === '') delete newProduct.barcode;

    await db.insert(products).values(newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id, createdAt, updatedAt, ...updateData } = req.body;
    const newId = id || uuidv4().slice(0, 8).toUpperCase();
    
    const finalUpdate = {
      ...updateData,
      id: newId,
      updatedAt: new Date(),
    };
    
    await db.update(products).set(finalUpdate).where(eq(products.id, req.params.id));
    res.json({ id: req.params.id, ...finalUpdate });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    await db.delete(products).where(eq(products.id, req.params.id));
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
