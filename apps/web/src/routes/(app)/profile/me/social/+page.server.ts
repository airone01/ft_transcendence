import { fail } from "@sveltejs/kit";
import { db } from "@transc/db";
import { friendshipsInvitations, users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  DBAddFriendFriendshipAlreadyExistsError,
  dbAddFriend,
  dbGetFriendsInfo,
  dbGetInvitations,
  dbGetRandomUsers,
  dbGetUserByUsername,
  dbRejectFriendship,
  dbRemoveFriend,
  dbRequestFriendship,
} from "$lib/server/db-services";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) return { friends: [], users: [], invitations: [] };

  const friends = await dbGetFriendsInfo(locals.user.id);
  const suggestedUsers = await dbGetRandomUsers(locals.user.id);
  const invitations = await dbGetInvitations(locals.user.id);

  return {
    users: suggestedUsers,
    friends,
    invitations,
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

      await dbRequestFriendship(locals.user.id, targetUser.id);
      return { success: true, message: `Sent friend request to ${username}` };
    } catch (error) {
      if (error instanceof DBAddFriendFriendshipAlreadyExistsError) {
        return fail(400, {
          error: "You are already friends or an invite is pending",
        });
      }
      console.error(error);
      return fail(500, { error: "Failed to send friend request" });
    }
  },

  accept: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const senderId = Number(formData.get("userId"));

    if (!senderId || Number.isNaN(senderId))
      return fail(400, { error: "Invalid user ID" });

    try {
      await dbAddFriend(locals.user.id, senderId);
      await dbRejectFriendship(senderId, locals.user.id);

      return { success: true, message: "Friend request accepted" };
    } catch (error) {
      console.error(error);
      return fail(500, { error: "Failed to accept friend request" });
    }
  },

  reject: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const senderId = Number(formData.get("userId"));

    if (!senderId || Number.isNaN(senderId))
      return fail(400, { error: "Invalid user ID" });

    try {
      await dbRejectFriendship(senderId, locals.user.id);
      return { success: true, message: "Friend request rejected" };
    } catch (error) {
      console.error(error);
      return fail(500, { error: "Failed to reject friend request" });
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
