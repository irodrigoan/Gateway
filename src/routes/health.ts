import type { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/health", async (_req, reply) => {
    const mem = process.memoryUsage();
    const connections = await new Promise<number>((resolve, reject) => {
      app.server.getConnections((err, count) =>
        err ? reject(err) : resolve(count),
      );
    });

    return reply.send({
      status: "ok",
      uptime: process.uptime(),
      connections,
      memory: {
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        rss: Math.round(mem.rss / 1024 / 1024),
      },
    });
  });
}
