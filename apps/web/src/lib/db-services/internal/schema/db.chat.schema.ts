export type ChatChannelType = "global" | "game" | "private";

export type ChatMessageType = {
  channelId: number;
  messageId: number;
  userId: number;
  content: string;
  createdAt: Date;
};
