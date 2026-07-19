import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';

export const productRouter = Router();

let products = [
  { id: 'p-100', name: 'Node.js Fundamentals', category: 'course', price: 49.99 },
  { id: 'p-200', name: 'Express API Workshop', category: 'course', price: 79.99 },
  { id: 'p-300', name: 'API Security Checklist', category: 'guide', price: 19.99 }
];

const ProductSchema = z.object({
  name: z.string().trim().min(2).max(100),
  category: z.enum(['course', 'guide', 'tool']),
  price: z.coerce.number().positive().max(10000)
}).strict();

productRouter.get('/', (req, res) => {
  const query = String(req.query.q || '').trim().toLowerCase();
  const category = String(req.query.category || '').trim().toLowerCase();
  const result = products.filter((product) => {
    const matchesText = !query || product.name.toLowerCase().includes(query);
    const matchesCategory = !category || product.category === category;
    return matchesText && matchesCategory;
  });
  res.json({ count: result.length, data: result });
});

productRouter.get('/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) return res.status(404).json({ type: 'about:blank', title: 'Product Not Found', status: 404, detail: `No product exists with id ${req.params.id}` });
  res.json(product);
});

productRouter.post('/', validate(ProductSchema), (req, res) => {
  const product = { id: randomUUID(), ...req.body };
  products.push(product);
  res.status(201).location(`/api/products/${product.id}`).json(product);
});

productRouter.put('/:id', validate(ProductSchema), (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ type: 'about:blank', title: 'Product Not Found', status: 404, detail: `No product exists with id ${req.params.id}` });
  products[index] = { id: products[index].id, ...req.body };
  res.json(products[index]);
});

productRouter.delete('/:id', (req, res) => {
  const index = products.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ type: 'about:blank', title: 'Product Not Found', status: 404, detail: `No product exists with id ${req.params.id}` });
  products.splice(index, 1);
  res.status(204).end();
});
