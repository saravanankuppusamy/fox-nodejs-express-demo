import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();
const PORT = process.env.PORT || 3006;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const delay = (ms, value) => new Promise((resolve) => setTimeout(() => resolve(value), ms));

app.get('/api/config', async (req, res) => {
  const raw = await readFile(path.join(__dirname, 'data/config.json'), 'utf8');
  res.json(JSON.parse(raw));
});

app.get('/api/dashboard', async (req, res) => {
  const [users, orders] = await Promise.all([
    delay(300, [{ id: 1, name: 'Alice' }]),
    delay(450, [{ id: 101, total: 89.5 }])
  ]);
  res.json({ users, orders });
});

app.get('/api/fail', async () => {
  await delay(100);
  const error = new Error('Demonstration error from an async route');
  error.status = 503;
  error.title = 'Demo Service Unavailable';
  throw error;
});

app.use((req, res) => {
  res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404, detail: `No route matches ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    type: 'about:blank',
    title: err.title || (status === 500 ? 'Internal Server Error' : 'Request Failed'),
    status,
    detail: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

app.listen(PORT, () => console.log(`Async/error demo: http://localhost:${PORT}`));
