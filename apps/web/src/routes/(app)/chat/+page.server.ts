import { dbGetGlobalMessages } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const messages = await dbGetGlobalMessages();

  return {
    initialMessages: messages.reverse().map((m) => ({
      userId: String(m.userId),
      username: "…",
      content: m.content,
      timestamp: m.createdAt.toISOString(),
    })),
  };
};
