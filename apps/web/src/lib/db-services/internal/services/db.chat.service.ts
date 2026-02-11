import { db } from "@transc/db";
import {
  and,
  desc,
  DrizzleQueryError,
  eq,
  inArray,
  ne,
  or,
  sql,
} from "drizzle-orm";
import type { DatabaseError } from "pg";
import {
  DBChatChannelNotFoundError,
  DBCreateChatChannelError,
  DBDeleteChatChannelError,
  UnknownError,
  type ChatChannelType,
  type ChatMessageType,
} from "$lib/db-services";
import {
  chatChannelMembers,
  chatChannels,
  chatMessages,
} from "@transc/db/schema";
import { alias } from "drizzle-orm/pg-core";

/**
 * Creates a chat channel in the database.
 * @param {ChatChannelType} type - The type of the chat channel.
 * @param {number | null} gameId - The ID of the game that the chat channel belongs to.
 * @throws {DBCreateChatChannelError} - If the type is "game" and the gameId is null.
 * @throws {UnknownError} - If an unexpected error occurs.
 * @returns {Promise<number>} - A promise that resolves with the ID of the created chat channel.
 */
export async function dbCreateChatChannel(
  type: ChatChannelType,
  gameId: number | null,
): Promise<number> {
  if (type === "game" && gameId === null) throw new DBCreateChatChannelError();

  try {
    const [chatChannel] = await db
      .insert(chatChannels)
      .values({
        type: type,
        gameId: gameId,
      })
      .returning();

    return chatChannel.id;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Deletes a chat channel from the database.
 * @param {number} chatChannelId - The ID of the chat channel to delete.
 * @throws {DBDeleteChatChannelError} - If the chat channel to delete is the default global chat channel.
 * @throws {DBChatChannelNotFoundError} - If the chat channel is not found.
 * @throws {UnknownError} - If an unexpected error occurs.
 * @returns {Promise<void>} - A promise that resolves when the chat channel is deleted, or rejects if the chat channel is not found or an unexpected error occurs.
 */
export async function dbDeleteChatChannel(
  chatChannelId: number,
): Promise<void> {
  if (chatChannelId === 1) throw new DBDeleteChatChannelError();

  try {
    const [chatChannel] = await db
      .delete(chatChannels)
      .where(eq(chatChannels.id, chatChannelId))
      .returning();

    if (!chatChannel) throw new DBChatChannelNotFoundError();
  } catch (err) {
    if (err instanceof DBChatChannelNotFoundError) throw err;

    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Sends a message to the global chat channel.
 * @param {number} userId - The ID of the user sending the message
 * @param {string} content - The content of the message
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<number>} - A promise that resolves with the ID of the global chat channel (which is always 1)
 */
export async function dbSendToGlobal(
  userId: number,
  content: string,
): Promise<number> {
  try {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values({
        channelId: 1,
        userId: userId,
        content: content,
      })
      .returning();

    return chatMessage.channelId;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Sends a message to a friend in a private chat channel.
 * @param {number} userId - The ID of the user sending the message
 * @param {number} friendId - The ID of the friend to send the message to
 * @param {string} content - The content of the message
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<number>} - A promise that resolves with the ID of the private chat channel
 */
export async function dbSendToFriend(
  userId: number,
  friendId: number,
  content: string,
): Promise<number> {
  try {
    const channelId = await db.transaction(async (tx) => {
      const channelMembers1 = alias(chatChannelMembers, "cm1");
      const channelMembers2 = alias(chatChannelMembers, "cm2");

      const [channel] = await tx
        .select({ id: chatChannels.id })
        .from(chatChannels)
        .innerJoin(
          channelMembers1,
          and(
            eq(chatChannels.id, channelMembers1.channelId),
            eq(channelMembers1.userId, userId),
          ),
        )
        .innerJoin(
          channelMembers2,
          and(
            eq(channelMembers1.channelId, channelMembers2.channelId),
            eq(channelMembers2.userId, friendId),
          ),
        )
        .where(eq(chatChannels.type, "private"))
        .limit(1);

      const [_chatMessage] = await tx
        .insert(chatMessages)
        .values({
          channelId: channel.id,
          userId: userId,
          content: content,
        })
        .returning();

      return channel.id;
    });

    return channelId;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Sends a message to the chat channel of a game.
 * @param {number} userId - The ID of the user sending the message
 * @param {number} gameId - The ID of the game that the chat channel belongs to
 * @param {string} content - The content of the message
 * @throws {DBChatChannelNotFoundError} - If the chat channel is not found
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<number>} - A promise that resolves with the ID of the chat channel
 */
export async function dbSendToGame(
  userId: number,
  gameId: number,
  content: string,
): Promise<number> {
  try {
    const channel = await db.transaction(async (tx) => {
      const [channel] = await tx
        .select({ id: chatChannels.id })
        .from(chatChannels)
        .where(eq(chatChannels.gameId, gameId))
        .limit(1);

      const [_chatMessage] = await tx
        .insert(chatMessages)
        .values({
          channelId: channel.id,
          userId: userId,
          content: content,
        })
        .returning();

      if (!channel) throw new DBChatChannelNotFoundError();

      return channel.id;
    });

    return channel;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

export async function dbGetGlobalMessages(): Promise<ChatMessageType[]> {
  try {
    const messages = await db
      .select({
        channelId: chatMessages.channelId,
        messageId: chatMessages.id,
        userId: chatMessages.userId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .where(eq(chatMessages.channelId, 1))
      .orderBy(desc(chatMessages.createdAt));

    return messages as ChatMessageType[];
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

export async function dbGetGameMessages(
  gameId: number,
): Promise<ChatMessageType[]> {
  try {
    const messages = await db
      .select({
        channelId: chatMessages.channelId,
        messageId: chatMessages.id,
        userId: chatMessages.userId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .innerJoin(chatChannels, eq(chatMessages.channelId, chatChannels.id))
      .where(eq(chatChannels.gameId, gameId))
      .orderBy(desc(chatMessages.createdAt));

    return messages as ChatMessageType[];
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

export async function dbGetFriendMessages(
  userId: number,
  friendId: number,
): Promise<ChatMessageType[]> {
  try {
    const channelMembers1 = alias(chatChannelMembers, "cm1");
    const channelMembers2 = alias(chatChannelMembers, "cm2");

    const messages = await db
      .select({
        channelId: chatMessages.channelId,
        messageId: chatMessages.id,
        userId: chatMessages.userId,
        content: chatMessages.content,
        createdAt: chatMessages.createdAt,
      })
      .from(chatMessages)
      .innerJoin(chatChannels, eq(chatMessages.channelId, chatChannels.id))
      .innerJoin(
        channelMembers1,
        eq(chatMessages.channelId, channelMembers1.channelId),
      )
      .innerJoin(
        channelMembers2,
        eq(channelMembers1.channelId, channelMembers2.channelId),
      )
      .where(
        and(
          eq(channelMembers1.userId, userId),
          eq(channelMembers2.userId, friendId),
          eq(chatChannels.type, "private"),
        ),
      )
      .orderBy(desc(chatMessages.createdAt));

    return messages as ChatMessageType[];
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}
