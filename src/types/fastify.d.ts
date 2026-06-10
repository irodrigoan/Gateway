import "fastify";

declare module "fastify" {
  interface FastifyInstance {
    isShuttingDown: boolean;
  }
}
