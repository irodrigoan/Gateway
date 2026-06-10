import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

export async function setupRateLimit(app: FastifyInstance) {
  app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
}
