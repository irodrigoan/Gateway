import { env } from "./env.js";

export const services = [
  {
    prefix: "/auth",
    upstream: env.AUTH_SERVICE_URL,
    auth: false,
  },
];
