import { fail } from "@sveltejs/kit";
import * as m from "$lib/paraglide/messages";
import {
  DBAddFriendFriendshipAlreadyExistsError,
  dbAddFriend,
  dbGetFriendsInfo,
  dbGetInvitations,
  dbGetRandomUsers,
  dbGetUserByUsername,
  dbGetUsersActiveGames,
  dbRejectFriendship,
  dbRemoveFriend,
  dbRequestFriendship,
} from "$lib/server/db-services";
import { checkHttpRateLimit } from "$lib/server/http-rate-limiter";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user)
    return {
      friends: [],
      suggestedUsers: [],
      invitations: [],
      activeGames: {},
    };

  try {
    const friends = await dbGetFriendsInfo(locals.user.id);
    const suggestedUsers = await dbGetRandomUsers(locals.user.id);
    const invitations = await dbGetInvitations(locals.user.id);

    const allUserIds = [...friends, ...suggestedUsers].map((u) => u.userId);
    const activeGames = await dbGetUsersActiveGames(allUserIds);

    return {
      friends,
      suggestedUsers,
      invitations,
      activeGames,
    };
  } catch (err) {
    console.error("Failed to load social data:", err);
    return {
      friends: [],
      suggestedUsers: [],
      invitations: [],
      activeGames: {},
    };
  }
};

export const actions: Actions = {
  add: async ({ request, locals, getClientAddress }) => {
    if (!locals.user) return fail(401);
    if (!checkHttpRateLimit(getClientAddress(), 60, "social"))
      return fail(429, { error: "Too many requests" });

    const formData = await request.formData();
    const username = formData.get("username")?.toString();

    if (!username)
      return fail(400, {
        error: m.profile_page_action_add_username_required(),
      });

    if (username === locals.user.username)
      return fail(400, { error: m.profile_page_action_add_add_yourself() });

    try {
      const targetUser = await dbGetUserByUsername(username);
      if (!targetUser)
        return fail(404, { error: m.profile_page_action_add_user_not_found() });

      await dbRequestFriendship(locals.user.id, targetUser.id);
      return {
        success: true,
        message: m.profile_page_action_add_success({ username }),
      };
    } catch (error) {
      if (error instanceof DBAddFriendFriendshipAlreadyExistsError) {
        return fail(400, { error: m.profile_page_action_add_fail() });
      }
      console.error(error);
      return fail(500, { error: m.profile_page_action_add_internal_error() });
    }
  },

  accept: async ({ request, locals, getClientAddress }) => {
    if (!locals.user) return fail(401);
    if (!checkHttpRateLimit(getClientAddress(), 60, "social"))
      return fail(429, { error: "Too many requests" });

    const formData = await request.formData();
    const senderId = Number(formData.get("userId"));

    if (!senderId || Number.isNaN(senderId))
      return fail(400, {
        error: m.profile_page_action_accept_invalid_userid(),
      });

    try {
      await dbAddFriend(locals.user.id, senderId);
      await dbRejectFriendship(senderId, locals.user.id);
      return { success: true, message: m.profile_page_action_accept_success() };
    } catch (error) {
      console.error(error);
      return fail(500, {
        error: m.profile_page_action_accept_internal_error(),
      });
    }
  },

  reject: async ({ request, locals, getClientAddress }) => {
    if (!locals.user) return fail(401);
    if (!checkHttpRateLimit(getClientAddress(), 60, "social"))
      return fail(429, { error: "Too many requests" });

    const formData = await request.formData();
    const senderId = Number(formData.get("userId"));

    if (!senderId || Number.isNaN(senderId))
      return fail(400, {
        error: m.profile_page_action_reject_invalid_userid(),
      });

    try {
      await dbRejectFriendship(senderId, locals.user.id);
      return { success: true, message: m.profile_page_action_reject_success() };
    } catch (error) {
      console.error(error);
      return fail(500, {
        error: m.profile_page_action_reject_internal_error(),
      });
    }
  },

  remove: async ({ request, locals, getClientAddress }) => {
    if (!locals.user) return fail(401);
    if (!checkHttpRateLimit(getClientAddress(), 60, "social"))
      return fail(429, { error: "Too many requests" });

    const formData = await request.formData();
    const friendId = Number(formData.get("friendId"));

    if (!friendId || Number.isNaN(friendId))
      return fail(400, {
        error: m.profile_page_action_remove_invalid_userid(),
      });

    try {
      await dbRemoveFriend(locals.user.id, friendId);
      return { success: true, message: m.profile_page_action_remove_success() };
    } catch (error) {
      console.error(error);
      return fail(500, {
        error: m.profile_page_action_remove_internal_error(),
      });
    }
  },
};
