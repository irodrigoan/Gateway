import { env } from "./env.js";
import { app } from "./app.js";
import { setupShutdown } from "./shutdown.js";

app.listen({ host: "::", port: env.PORT }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

setupShutdown(app);
