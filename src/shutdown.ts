import type { FastifyInstance } from "fastify";

export function setupShutdown(app: FastifyInstance) {
  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down...`);
    app.isShuttingDown = true;
    try {
      await app.close();
      app.log.info("Server closed successfully");
      process.exit(0);
    } catch (err) {
      app.log.error(err, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    app.log.fatal({ err }, "Uncaught exception");
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    app.log.fatal({ reason }, "Unhandled rejection");
    shutdown("unhandledRejection");
  });
}
