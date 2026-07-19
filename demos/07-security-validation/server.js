import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

const app = express();
const PORT = process.env.PORT || 3007;
const allowedOrigin = process.env.ALLOWED_ORIGIN || `http://localhost:${PORT}`;

const UserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  age: z.coerce.number().int().min(0).max(130).optional()
}).strict();

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        type: 'about:blank', title: 'Validation Failed', status: 400,
        errors: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
      });
    }
    req.body = result.data;
    next();
  };
}

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: allowedOrigin }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.post('/api/users', validate(UserSchema), (req, res) => {
  res.status(201).json({ id: randomUUID(), ...req.body });
});

app.use((req, res) => res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: process.env.NODE_ENV === 'production' ? 'Unexpected error' : err.message });
});

app.listen(PORT, () => console.log(`Security/validation demo: http://localhost:${PORT}`));
