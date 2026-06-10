import type { FastifyInstance } from "fastify";
import httpProxy from "@fastify/http-proxy";
import { services } from "../config.js";

export async function setupProxy(app: FastifyInstance) {
  for (const service of services) {
    app.register(httpProxy, {
      upstream: service.upstream,
      prefix: service.prefix,
      replyOptions: {
        onError(reply, { error }) {
          app.log.error({ error, upstream: service.upstream }, "Upstream unavailable");
          reply.status(503).send({ error: "Service unavailable" });
        },
      },
    });
  }
}
