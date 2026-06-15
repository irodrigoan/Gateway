import type { FastifyInstance } from "fastify";
import fastifyJwt from "@fastify/jwt";
import { services } from "../config.js";
import { env } from "../env.js";

// Identity headers the gateway injects after verifying the JWT. The gateway is
// the only public entrypoint, so a client could try to spoof these — we strip
// any inbound copy on every request and only set them ourselves post-verify.
const IDENTITY_HEADERS = ["x-user-id", "x-user-actions"];

export async function setupAuth(app: FastifyInstance) {
  app.register(fastifyJwt, {
    secret: {
      public: Buffer.from(env.JWT_PUBLIC_KEY, "base64"),
    },
  });

  app.addHook("onRequest", async (req, reply) => {
    // Prevent header spoofing: drop anything the client sent, always.
    for (const header of IDENTITY_HEADERS) {
      delete req.headers[header];
    }

    const service = services.find((s) => req.url.startsWith(s.prefix));

    if (service?.auth) {
      try {
        await req.jwtVerify();
      } catch {
        return reply.status(401).send({ error: "Unauthorized" });
      }

      // Forward the verified identity downstream so services can trust it
      // without touching the JWT themselves.
      const { sub, actions } = req.user;
      if (sub) req.headers["x-user-id"] = sub;
      if (actions) req.headers["x-user-actions"] = JSON.stringify(actions);
    }

    // The gateway is the only thing that needs the raw token. Strip it before
    // forwarding (after jwtVerify above has consumed it) so the credential
    // never reaches any downstream service.
    delete req.headers["authorization"];
  });
}
