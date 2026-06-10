import { config } from "dotenv";
import { z } from "zod";

config({ quiet: true });

const schema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(3333),
  JWT_PUBLIC_KEY: z.base64().min(1),
  AUTH_SERVICE_URL: z.url(),
  USERS_SERVICE_URL: z.url(),
  CORS_ORIGIN: z.string().default("*"),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:");
  console.error(z.flattenError(result.error).fieldErrors);
  process.exit(1);
}

export const env = result.data;
