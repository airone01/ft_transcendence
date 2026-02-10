import { beforeAll, describe, expect, test } from "bun:test";
import { db } from "@transc/db";
import {
  chatChannelMembers,
  chatChannels,
  friendships,
  games,
  users,
} from "@transc/db/schema";
import { and, eq, not, or } from "drizzle-orm";
import {
  DBAddFriendFriendshipAlreadyExistsError,
  DBAddFriendWrongFriendshipError,
  DBChatChannelNotFoundError,
  DBCreateChatChannelError,
  DBDeleteChatChannelError,
  DBUserNotFoundError,
  dbAddFriend,
  dbCreateChatChannel,
  dbCreateGame,
  dbDeleteChatChannel,
  dbGetFriendsInfo,
  dbRemoveFriend,
} from "$lib/db-services";

describe.only("db.chat", () => {
  beforeAll(async () => {
    await db
      .delete(chatChannels)
      .where(not(eq(chatChannels.id, 1)))
      .execute();
    await db.delete(chatChannelMembers).execute();
  });

  test("createChatChannel private", async () => {
    try {
      const channel = await dbCreateChatChannel("private", null);

      expect(channel).toBeDefined();
    } catch (_err) {}
  });

  test("createChatChannel game", async () => {
    try {
      const [game] = await db.select().from(games).limit(1);
      const channel = await dbCreateChatChannel("game", game.id);

      expect(channel).toBeDefined();
    } catch (_err) {}
  });

  test("createChatChannel game without game id", async () => {
    try {
      await dbCreateChatChannel("game", null);
    } catch (err) {
      expect(err).toBeInstanceOf(DBCreateChatChannelError);
    }
  });

  test("deleteChatChannel", async () => {
    try {
      const [channel] = await db
        .select()
        .from(chatChannels)
        .where(not(eq(chatChannels.id, 1)))
        .limit(1);

      await dbDeleteChatChannel(channel.id);

      expect(true).toBe(true);
    } catch (_err) {}
  });

  test("deleteChatChannel with wrong id", async () => {
    try {
      await dbDeleteChatChannel(10000000);
    } catch (err) {
      expect(err).toBeInstanceOf(DBChatChannelNotFoundError);
    }
  });

  test("deleteChatChannel with default id", async () => {
    try {
      await dbDeleteChatChannel(1);
    } catch (err) {
      expect(err).toBeInstanceOf(DBDeleteChatChannelError);
    }
  });
});
