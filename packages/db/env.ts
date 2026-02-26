import { z } from "zod";
import "dotenv/config";

// In tests we may not have a real DATABASE_URL available.
// Make the DATABASE_URL optional when running under NODE_ENV === 'test'
const schema =
  process.env.NODE_ENV === "test"
    ? z.object({ DATABASE_URL: z.string().optional() })
    : z.object({ DATABASE_URL: z.string() });

const { success, error, data: env } = schema.safeParse(process.env);

if (!success) {
  throw new Error(`Env error: ${error}\n`);
}

export { env };
