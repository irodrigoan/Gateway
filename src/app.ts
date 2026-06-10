import fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { setupRateLimit } from "./plugins/rateLimit.js";
import { setupAuth } from "./plugins/auth.js";
import { setupProxy } from "./plugins/proxy.js";
import { healthRoutes } from "./routes/health.js";

const isDev = process.env.NODE_ENV !== "production";

// "*" allows everything; otherwise a comma-separated list of origins.
const corsOrigin =
  env.CORS_ORIGIN === "*"
    ? "*"
    : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

export const app = fastify({
  logger: {
    level: isDev ? "debug" : "info",
  },
  connectionTimeout: 30_000,
  requestTimeout: 30_000,
});

app.decorate("isShuttingDown", false);

app.register(cors, {
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

setupRateLimit(app);

app.addHook("onRequest", async (_req, reply) => {
  if (app.isShuttingDown) {
    return reply.status(503).send({ status: "Unavailable" });
  }
});

// TEMP: check IP resolution behind the proxy (Railway). Remove after testing.
app.addHook("onRequest", async (req) => {
  req.log.info({ ip: req.ip, xff: req.headers["x-forwarded-for"] }, "ip-check");
});

app.setNotFoundHandler((req, reply) => {
  reply.status(404).send({
    error: "Not found",
    message: `Route ${req.method} ${req.url} not found`,
    statusCode: 404,
  });
});

app.register(healthRoutes);
setupAuth(app);
setupProxy(app);
