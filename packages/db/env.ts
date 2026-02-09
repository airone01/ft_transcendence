import { z } from "zod";
import "dotenv/config";

const {
  success,
  error,
  data: env,
} = z
  .object({
    DATABASE_URL: z.string(),
  })
  .safeParse(process.env);

if (!success) {
  throw new Error(`Env error: ${error}\n`);
}

export { env };
