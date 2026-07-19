import { randomUUID } from 'node:crypto';

export function requestLogger(req, res, next) {
  const started = Date.now();
  req.requestId = randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  res.on('finish', () => {
    console.log(JSON.stringify({
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - started
    }));
  });
  next();
}
