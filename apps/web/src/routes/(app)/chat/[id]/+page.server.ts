import { redirect } from "@sveltejs/kit";
import { dbGetFriendMessages, dbIsFriend } from "$lib/server/db-services";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user) throw redirect(302, "/");

  const friendId = parseInt(params.id, 10);
  if (Number.isNaN(friendId)) throw redirect(302, "/profile/me/social?error=chat_not_found"); //TODO

  try {
    const areFriends = await dbIsFriend(locals.user.id, friendId);
    if (!areFriends) throw redirect(302, "/profile/me/social?error=chat_not_found"); //TODO

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
    if (err instanceof Response || (err as { status?: number })?.status) throw err;
    console.error("Failed to load friend messages:", err);
    throw redirect(302, "/profile/me/social?error=chat_not_found"); //TODO
  }
};
