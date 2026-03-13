import { redirect } from "@sveltejs/kit";
import { dbGetFriendMessages } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) throw redirect(302, "/");

  const friendId = parseInt(params.id, 10);
  if (Number.isNaN(friendId)) return { initialMessages: [] };

  try {
    const messages = await dbGetFriendMessages(locals.user.id, friendId);

    return {
      initialMessages: messages.reverse().map((m) => ({
        userId: String(m.userId),
        username: m.username,
        content: m.content,
        timestamp: m.createdAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Failed to load friend messages:", err);
    return { initialMessages: [] };
  }
};
