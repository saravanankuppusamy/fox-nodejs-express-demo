# Node.js and Express — Two-Hour Demo Bundle

A progressive instructor-ready collection of Node.js and Express examples. The demos move from the Node runtime and ES modules to REST routing, middleware, async error handling, validation, security, and a small capstone API.

## Prerequisites

- Node.js 20 or later; Node.js 22 recommended
- npm
- VS Code with the REST Client extension, Postman, Insomnia, or curl

## Setup

```bash
npm install
cp .env.example .env
```

On Windows PowerShell:

```powershell
npm install
Copy-Item .env.example .env
```

## Run the demos

Run one demo at a time. Stop a server with `Ctrl+C` before starting another one.

```bash
npm run demo:node
npm run demo:modules
npm run demo:minimal
npm run demo:routes
npm run demo:middleware
npm run demo:async
npm run demo:secure
npm run demo:capstone
```

Open `requests/api.http` in VS Code to send prepared requests. Each server uses a separate port so two demos can run concurrently if desired.

## Demo map

| Folder | Topic | Default port |
|---|---|---:|
| `01-node-runtime` | Runtime, built-ins, event-loop ordering | n/a |
| `02-es-modules` | `import`, `export`, named/default exports | n/a |
| `03-minimal-express` | Minimal server and health endpoint | 3003 |
| `04-routing-crud` | REST methods, params, queries, route ordering, CRUD | 3004 |
| `05-middleware-and-forms` | Custom middleware, JSON/form parsing, static files | 3005 |
| `06-async-errors` | Async/await, `Promise.all`, 404 and centralized errors | 3006 |
| `07-security-validation` | Helmet, CORS, rate limits, Zod validation | 3007 |
| `capstone` | Structured product API with browser client | 3010 |

## Testing

```bash
npm test
```

The included smoke test starts the minimal Express server, calls its health endpoint, and shuts it down.

## Suggested classroom flow

Use `INSTRUCTOR_GUIDE.md` for a minute-by-minute delivery plan, talking points, demo steps, expected output, common mistakes, and review questions.
