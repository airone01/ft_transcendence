import { error } from "@sveltejs/kit";
import { dbGetGlobalMessages } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  try {
    const messages = await dbGetGlobalMessages();

    return {
      initialMessages: messages.reverse().map((m) => ({
        userId: String(m.userId),
        username: m.username,
        content: m.content,
        timestamp: m.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Failed to load global messages:", err);
    throw error(500, "Failed to load chat messages");
  }
};
