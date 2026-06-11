import { env } from "./env.js";

export const services = [
  {
    prefix: "/auth",
    upstream: env.AUTH_SERVICE_URL,
    auth: false,
  },
  {
    prefix: "/users",
    upstream: env.USERS_SERVICE_URL,
    auth: true,
  },
  {
    prefix: "/ip",
    upstream: env.IP_SERVICE_URL,
    auth: true,
  },
];
