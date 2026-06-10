# Gateway

API Gateway built with [Fastify](https://fastify.dev/) and TypeScript. It acts as the single entry point in front of the microservices, handling routing/proxying, JWT validation, rate limiting, CORS and graceful shutdown.

## Features

- **Reverse proxy** to the upstream services, configured per route prefix.
- **JWT authentication** per service — verifies the token signature with a public key (RS256). The token is forwarded untouched to the upstream.
- **Rate limiting** (global, 100 req/min per IP).
- **CORS** enabled and configurable via env.
- **Health check** with uptime, memory usage and connection count.
- **Graceful shutdown** (SIGTERM/SIGINT) that stops accepting requests and drains connections before exiting.
- **Environment validation** with [Zod](https://zod.dev/) — the app refuses to start with invalid variables.

## Stack

- Node.js (ESM, `nodenext`)
- Fastify 5
- `@fastify/http-proxy`, `@fastify/jwt`, `@fastify/rate-limit`, `@fastify/cors`
- Zod 4 for env validation
- TypeScript 6 (strict)

## Structure

```
src/
├── server.ts            # bootstrap: listen + shutdown setup
├── app.ts               # Fastify instance, plugins and global hooks
├── env.ts               # loads and validates environment variables (Zod)
├── config.ts            # list of proxied services (prefix, upstream, auth)
├── shutdown.ts          # graceful shutdown and process error handlers
├── plugins/
│   ├── proxy.ts         # registers the reverse proxy for each service
│   ├── auth.ts          # per-service JWT validation
│   └── rateLimit.ts     # rate limiting
├── routes/
│   └── health.ts        # GET /health
└── types/
    └── fastify.d.ts     # Fastify type augmentations
```

## Environment variables

Copy `.env.example` to `.env` and fill it in:

| Variable           | Required | Default       | Description                                                 |
| ------------------ | -------- | ------------- | ----------------------------------------------------------- |
| `NODE_ENV`         | no       | `development` | `development` or `production`.                              |
| `PORT`             | no       | `3333`        | Listening port. Injected automatically on Railway.          |
| `JWT_PUBLIC_KEY`   | yes      | —             | Public key in **base64** used to verify the JWT signatures. |
| `AUTH_SERVICE_URL` | yes      | —             | URL of the auth service that `/auth` is forwarded to.       |
| `CORS_ORIGIN`      | no       | `*`           | Allowed CORS origins: `*` or a comma-separated list.        |

## Generating the JWT keys

The gateway uses **RS256**. Tokens are signed by the auth service with a **private key**, and the gateway only needs the matching **public key** to verify their signature. The private key must **never** be shared with the gateway.

1. Generate the RSA private key (kept by the auth service):

   ```bash
   openssl genrsa -out private.pem 2048
   ```

2. Derive the public key from it:

   ```bash
   openssl rsa -in private.pem -pubout -out public.pem
   ```

3. The gateway expects the public key **base64-encoded** in `JWT_PUBLIC_KEY`. Encode `public.pem` into a single line:

   ```bash
   # macOS
   base64 -i public.pem | tr -d '\n'

   # Linux
   base64 -w0 public.pem
   ```

   Copy the output into `.env`:

   ```
   JWT_PUBLIC_KEY=<base64 output>
   ```

The auth service signs tokens with `private.pem` (RS256); keep that file secret and out of version control.

## Running

Requires Node.js 20+.

```bash
# install dependencies
npm install

# development (hot reload via tsx)
npm run dev

# production build
npm run build

# run the build
npm start
```

## Endpoints

| Method | Route     | Auth | Description                                   |
| ------ | --------- | ---- | --------------------------------------------- |
| GET    | `/health` | no   | Gateway status (uptime, memory, connections). |
| \*     | `/auth/*` | no   | Forwarded to `AUTH_SERVICE_URL`.              |

## Adding a new service

Proxied services live in [`src/config.ts`](src/config.ts). Each entry has:

```ts
export const services = [
  {
    prefix: "/auth", // route prefix on the gateway
    upstream: env.AUTH_SERVICE_URL, // base URL of the target service
    auth: false, // true requires a valid JWT to access
  },
];
```

When adding a service, remember to declare the matching URL in [`src/env.ts`](src/env.ts) and in `.env`.

## Deployment

The project runs on [Railway](https://railway.app/). The build command is `npm run build` and the start command is `npm start`; `PORT` is provided by the platform. Configure the remaining environment variables in the service settings.
