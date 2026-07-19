import express from 'express';
import { randomUUID } from 'node:crypto';

const app = express();
const PORT = process.env.PORT || 3004;
app.use(express.json({ limit: '1mb' }));

let users = [
  { id: randomUUID(), name: 'Alice', email: 'alice@example.com' },
  { id: randomUUID(), name: 'Bob', email: 'bob@example.com' }
];

// Put specific routes before parameterized routes.
app.get('/api/users/me', (req, res) => {
  res.json({ id: 'current-user', name: 'Demo User', email: 'me@example.com' });
});

app.get('/api/users', (req, res) => {
  const query = String(req.query.q || '').toLowerCase();
  const limit = Math.max(1, Math.min(Number(req.query.limit) || 20, 100));
  const result = users
    .filter((user) => !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
    .slice(0, limit);
  res.json({ count: result.length, data: result });
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find((item) => item.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const user = { id: randomUUID(), name: String(name).trim(), email: String(email).trim().toLowerCase() };
  users.push(user);
  res.status(201).json(user);
});

app.put('/api/users/:id', (req, res) => {
  const index = users.findIndex((item) => item.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'PUT requires both name and email' });
  users[index] = { id: users[index].id, name: String(name).trim(), email: String(email).trim().toLowerCase() };
  res.json(users[index]);
});

app.delete('/api/users/:id', (req, res) => {
  const before = users.length;
  users = users.filter((item) => item.id !== req.params.id);
  if (users.length === before) return res.status(404).json({ error: 'User not found' });
  res.status(204).end();
});

app.use((req, res) => {
  res.status(404).json({ error: `No route matches ${req.method} ${req.path}` });
});

app.listen(PORT, () => console.log(`Routing/CRUD demo: http://localhost:${PORT}`));
