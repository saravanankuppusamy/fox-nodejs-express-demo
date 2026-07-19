# Instructor Guide — Node.js and Express in Two Hours

## Learning outcomes

By the end of the session, learners should be able to:

1. Explain how Node.js runs JavaScript outside the browser and why non-blocking I/O matters.
2. Create an ESM-based Node project with npm scripts and dependencies.
3. Build an Express server with routes, parameters, query strings, and JSON request bodies.
4. Implement a small CRUD REST API using correct HTTP methods and status codes.
5. Explain middleware ordering and create custom middleware.
6. Use async/await and centralized Express 5 error handling.
7. Apply baseline production safeguards: Helmet, restricted CORS, rate limiting, body limits, environment variables, and Zod validation.

## Recommended agenda — 120 minutes

| Time | Topic | Demo |
|---:|---|---|
| 0–8 min | Goals, architecture, browser JavaScript vs server JavaScript | Whiteboard request/response flow |
| 8–20 min | Node runtime, built-in modules, event loop | Demo 01 |
| 20–30 min | npm, package.json, ESM | Demo 02 and project files |
| 30–43 min | Minimal Express server | Demo 03 |
| 43–65 min | Routing and CRUD REST API | Demo 04 |
| 65–82 min | Request lifecycle and middleware | Demo 05 |
| 82–98 min | Async programming and error handling | Demo 06 |
| 98–113 min | Security, validation, configuration | Demo 07 |
| 113–120 min | Capstone tour, recap, review questions | Capstone |

---

## Demo 01 — Node runtime and event loop

### Run

```bash
npm run demo:node
```

### Show

- `node:os` and `node:path` are built-in modules; no npm installation is needed.
- `process.version`, `process.uptime()`, and environment variables are server-runtime concepts.
- The output order demonstrates synchronous statements, promise microtasks, and timer callbacks.

### Expected event-loop output

```text
1. synchronous start
2. synchronous end
3. promise microtask
4. timer callback
```

### Teaching prompt

Ask: “Why does the zero-millisecond timer not run immediately?” Explain that it is queued; the current call stack and microtask queue complete first.

### Caution

Node handles I/O concurrency well, but CPU-heavy loops still block the single JavaScript thread. Worker threads or external workers are better for CPU-bound work.

---

## Demo 02 — ES modules

### Run

```bash
npm run demo:modules
```

### Open

- `demos/02-es-modules/math.js`
- `demos/02-es-modules/app.js`
- root `package.json`

### Explain

- `"type": "module"` enables ESM for `.js` files.
- Named exports use braces during import.
- A default export can be imported with any local name.
- Relative ESM imports include the `.js` extension.

### Quick exercise

Add a `subtract(a, b)` named export and call it from `app.js`.

---

## Demo 03 — Minimal Express server

### Run

```bash
npm run demo:minimal
```

Visit:

- `http://localhost:3003/`
- `http://localhost:3003/api/health`

### Build it live

1. Import Express.
2. Create the app with `express()`.
3. Choose a port from `process.env.PORT` with a local fallback.
4. Register `express.json({ limit: '1mb' })` before routes.
5. Add a GET route.
6. Start listening.

### Key points

- A route has an HTTP method, URL pattern, and handler.
- `res.json()` sets a JSON content type and serializes the object.
- The health endpoint is useful for monitoring and container orchestration.

### Common mistake

Starting a second server on the same port causes `EADDRINUSE`. Stop the first process or use another `PORT` value.

---

## Demo 04 — Routing and CRUD

### Run

```bash
npm run demo:routes
```

Use `requests/api.http` or curl.

### Route map

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/users` | List/search users |
| GET | `/api/users/me` | Specific route-ordering example |
| GET | `/api/users/:id` | Get one user |
| POST | `/api/users` | Create a user |
| PUT | `/api/users/:id` | Replace a user |
| DELETE | `/api/users/:id` | Delete a user |

### Demonstrate

1. Query strings: `/api/users?q=ali&limit=10`.
2. Route parameters: copy an ID from the list into `/api/users/:id`.
3. Valid and invalid POST requests.
4. A complete PUT request.
5. DELETE and the `204 No Content` response.
6. An unknown route and the final 404 middleware.

### Talking points

- Route matching is top-down. `/api/users/me` must appear before `/api/users/:id`.
- POST normally returns `201 Created`.
- Invalid client input normally returns `400 Bad Request`.
- Missing resources return `404 Not Found`.
- This demo stores data in memory, so changes disappear when the server restarts.

### Optional discussion

PUT conventionally replaces the whole resource. PATCH is normally used for partial updates.

---

## Demo 05 — Middleware, static files, and form parsing

### Run

```bash
npm run demo:middleware
```

Open `http://localhost:3005` and submit the form.

### Trace the request pipeline

1. Request logger starts a timer.
2. Request ID middleware adds an ID and response header.
3. Body parsers populate `req.body`.
4. Static middleware may serve the HTML/CSS without reaching a route.
5. The form POST reaches `/api/contact`.

### Explain the middleware rule

Every middleware must do one of these:

- call `next()`;
- send a response;
- forward an error with `next(err)` or throw in an Express 5 async handler.

If it does none of them, the request hangs.

### Live mistake demo

Temporarily remove `next()` from `addRequestId`, refresh the page, observe the hanging request, and restore it.

### Body parser comparison

- `express.json()` handles `application/json`.
- `express.urlencoded()` handles HTML form submissions.
- `express.static()` serves browser assets.

---

## Demo 06 — Async programming and centralized errors

### Run

```bash
npm run demo:async
```

Call:

- `GET /api/config`
- `GET /api/dashboard`
- `GET /api/fail`
- an unknown route

### Explain

- `node:fs/promises` provides non-blocking Promise APIs.
- `Promise.all()` runs independent operations concurrently.
- Express 5 forwards rejected async route promises to the error handler.
- The error handler requires four parameters: `(err, req, res, next)`.
- The 404 middleware is not the same as an error handler; it handles unmatched routes.

### Error response pattern

The example returns a Problem Details-style structure:

```json
{
  "type": "about:blank",
  "title": "Demo Service Unavailable",
  "status": 503,
  "detail": "Demonstration error from an async route"
}
```

### Production note

Do not return stack traces or internal implementation details to clients. Log diagnostic details on the server.

---

## Demo 07 — Security and validation

### Run

```bash
cp .env.example .env
npm run demo:secure
```

Call the valid and invalid Zod requests in `requests/api.http`.

### Layered safeguards

- `app.disable('x-powered-by')`: reduces unnecessary framework disclosure.
- `helmet()`: adds security-oriented HTTP headers.
- Restricted `cors(...)`: permits only an expected frontend origin.
- Rate limiting: slows brute-force and abusive traffic.
- JSON size limit: reduces oversized-body abuse.
- Zod: rejects unexpected, missing, or incorrectly typed data.
- Environment variables: keep deployment-specific values out of source code.

### Important nuance

CORS is a browser-enforced cross-origin policy; it is not authentication or authorization. Non-browser clients can still call an API unless access controls prevent them.

### Validation demo

Show how Zod:

- trims strings;
- validates email format;
- converts an age string to a number;
- rejects unknown fields because the schema is strict.

---

## Capstone — Product API

### Run

```bash
npm run demo:capstone
```

Open `http://localhost:3010`.

### Architecture tour

```text
capstone/
├── server.js
├── routes/products.js
├── middleware/requestLogger.js
├── middleware/validate.js
└── public/
```

### Concepts combined

- Router modules
- CRUD endpoints
- Query filtering
- Middleware chain
- Static browser client
- Zod validation
- Security middleware
- Problem Details-style errors
- Graceful shutdown hooks

### Suggested live extension

Ask learners to add a `GET /api/products/stats` route that returns the number of products and average price. Remind them to place `/stats` before `/:id`.

---

## Review questions

1. What is the difference between Node.js and Express?
2. Why does Node favor non-blocking I/O?
3. What does `"type": "module"` change?
4. What is the difference between `req.params`, `req.query`, and `req.body`?
5. Why must body parsers be registered before routes that use `req.body`?
6. What happens when middleware neither calls `next()` nor sends a response?
7. Why should a specific route be placed before a parameterized route?
8. What status codes would you use for successful creation, invalid input, missing data, and successful deletion?
9. How does Express 5 handle a rejected Promise in an async route?
10. Why is CORS not a replacement for authentication?
11. Why should `.env` be excluded from Git while `.env.example` is committed?
12. What security benefit does runtime schema validation provide?

## Optional hands-on challenge

Build a `/api/courses` router with these fields:

```text
id, title, durationHours, level
```

Requirements:

- GET all courses with optional `level` query filtering.
- GET one course by ID.
- POST with Zod validation.
- PUT and DELETE.
- Return appropriate status codes.
- Add a specific `/api/courses/featured` route before `/:id`.
- Use the existing centralized 404 and error handlers.

## Troubleshooting

### `ERR_MODULE_NOT_FOUND`

Run `npm install` from the bundle root.

### `Cannot use import statement outside a module`

Confirm the root `package.json` contains `"type": "module"` and run the command from the root directory.

### `req.body` is undefined

Confirm the appropriate parser is registered before the route and the request sends the correct `Content-Type` header.

### `EADDRINUSE`

Another process is using the port. Stop it, or override the port:

```bash
PORT=4010 npm run demo:capstone
```

PowerShell:

```powershell
$env:PORT=4010; npm run demo:capstone
```
