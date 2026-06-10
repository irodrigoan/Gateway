import type { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { services } from "../config.js";
import { env } from "../env.js";

export async function setupAuth(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: {
      public: Buffer.from(env.JWT_PUBLIC_KEY, "base64"),
    },
  });

  app.addHook("onRequest", async (req, reply) => {
    const service = services.find((s) => req.url.startsWith(s.prefix));

    if (!service || !service.auth) return;

    try {
      await req.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Unauthorized" });
    }
  });
}
