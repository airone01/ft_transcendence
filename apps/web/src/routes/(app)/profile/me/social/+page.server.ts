import { fail } from "@sveltejs/kit";
import {
  DBAddFriendFriendshipAlreadyExistsError,
  dbAddFriend,
  dbGetFriendsInfo,
  dbGetUserByUsername,
  dbRemoveFriend,
} from "$lib/server/db-services";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) return { friends: [] };

  const friends = await dbGetFriendsInfo(locals.user.id);

  return {
    friends,
  };
};

export const actions: Actions = {
  add: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const username = formData.get("username")?.toString();

    if (!username) return fail(400, { error: "Username is required" });

    if (username === locals.user.username)
      return fail(400, { error: "You cannot add yourself" });

    try {
      const targetUser = await dbGetUserByUsername(username);

      if (!targetUser) return fail(404, { error: "User not found" });

      await dbAddFriend(locals.user.id, targetUser.id);
      return { success: true, message: `Added ${username} as a friend` };
    } catch (error) {
      if (error instanceof DBAddFriendFriendshipAlreadyExistsError) {
        return fail(400, { error: "You are already friends with this user" });
      }
      console.error(error);
      return fail(500, { error: "Failed to add friend" });
    }
  },

  remove: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const friendId = Number(formData.get("friendId"));

    if (!friendId || Number.isNaN(friendId)) {
      return fail(400, { error: "Invalid friend ID" });
    }

    try {
      await dbRemoveFriend(locals.user.id, friendId);
      return { success: true, message: "Friend removed" };
    } catch (error) {
      console.error(error);
      return fail(500, { error: "Failed to remove friend" });
    }
  },
};
