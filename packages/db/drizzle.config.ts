import { defineConfig } from "drizzle-kit";
import { connectionString } from "./env";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: connectionString as string },
  breakpoints: true,
  verbose: true,
  strict: true,
});
