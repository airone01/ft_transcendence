import { z } from "zod";
import "dotenv/config";

const {
  success,
  error,
  data: connectionString,
} = z.string().safeParse(process.env.DATABASE_URL);

if (!success) {
  throw new Error(`Env error: ${error}\n`);
}

export { connectionString };
