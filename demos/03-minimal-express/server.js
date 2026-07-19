import express from 'express';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'API is running', status: 'ok' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptimeSeconds: Math.round(process.uptime()) });
});

app.listen(PORT, () => {
  console.log(`Minimal server: http://localhost:${PORT}`);
});
