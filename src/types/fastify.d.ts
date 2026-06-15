import "fastify";
import "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    isShuttingDown: boolean;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { sub: string; actions: string[] };
    user: { sub: string; actions: string[] };
  }
}
