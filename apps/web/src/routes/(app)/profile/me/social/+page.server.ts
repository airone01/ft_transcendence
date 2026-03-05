import { fail } from "@sveltejs/kit";
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
import * as m from "$lib/paraglide/messages";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user)
    return {
      friends: [],
      suggestedUsers: [],
      invitations: [],
    };

  const friends = await dbGetFriendsInfo(locals.user.id);
  const suggestedUsers = await dbGetRandomUsers(locals.user.id);
  const invitations = await dbGetInvitations(locals.user.id);

  return {
    friends,
    suggestedUsers,
    invitations,
  };
};

export const actions: Actions = {
  add: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

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
        return fail(400, {
          error: m.profile_page_action_add_fail(),
        });
      }
      console.error(error);
      return fail(500, { error: m.profile_page_action_add_internal_error() });
    }
  },

  accept: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const senderId = Number(formData.get("userId"));

    if (!senderId || Number.isNaN(senderId))
      return fail(400, {
        error: m.profile_page_action_accept_invalid_userid(),
      });

    try {
      await dbAddFriend(locals.user.id, senderId);
      await dbRejectFriendship(senderId, locals.user.id);

      return {
        success: true,
        message: m.profile_page_action_accept_success(),
      };
    } catch (error) {
      console.error(error);
      return fail(500, {
        error: m.profile_page_action_accept_internal_error(),
      });
    }
  },

  reject: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const senderId = Number(formData.get("userId"));

    if (!senderId || Number.isNaN(senderId))
      return fail(400, {
        error: m.profile_page_action_reject_invalid_userid(),
      });

    try {
      await dbRejectFriendship(senderId, locals.user.id);
      return {
        success: true,
        message: m.profile_page_action_reject_success(),
      };
    } catch (error) {
      console.error(error);
      return fail(500, {
        error: m.profile_page_action_reject_internal_error(),
      });
    }
  },

  remove: async ({ request, locals }) => {
    if (!locals.user) return fail(401);

    const formData = await request.formData();
    const friendId = Number(formData.get("friendId"));

    if (!friendId || Number.isNaN(friendId)) {
      return fail(400, {
        error: m.profile_page_action_remove_invalid_userid(),
      });
    }

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
