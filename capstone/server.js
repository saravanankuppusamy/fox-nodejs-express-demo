import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { productRouter } from './routes/products.js';
import { requestLogger } from './middleware/requestLogger.js';

export function createApp() {
  const app = express();
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3010';

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: allowedOrigin }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-7', legacyHeaders: false }));
  app.use(morgan('dev'));
  app.use(requestLogger);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', node: process.version, uptimeSeconds: Math.round(process.uptime()) });
  });
  app.use('/api/products', productRouter);

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
      detail: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      requestId: req.requestId
    });
  });

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3010;
  const app = createApp();
  const server = app.listen(PORT, () => console.log(`Capstone API: http://localhost:${PORT}`));

  const shutdown = (signal, exitCode) => {
    console.log(`${signal} received; closing HTTP server...`);
    server.close(() => process.exit(exitCode));
  };
  process.on('SIGTERM', () => shutdown('SIGTERM', 0));
  process.on('SIGINT', () => shutdown('SIGINT', 0));
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    shutdown('unhandledRejection', 1);
  });
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    shutdown('uncaughtException', 1);
  });
}
