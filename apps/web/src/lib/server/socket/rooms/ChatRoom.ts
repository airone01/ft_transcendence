import type { Socket } from "socket.io";

export class ChatRoom {
  private roomId: string;
  private sockets: Set<Socket> = new Set();
  private messageHistory: {
    userId: string;
    username: string;
    content: string;
    timestamp: string;
  }[] = [];
  private maxHistory: number;

  constructor(roomId: string, maxHistory = 100) {
    this.roomId = roomId;
    this.maxHistory = maxHistory;
  }

  addSocket(socket: Socket) {
    this.sockets.add(socket);
  }

  removeSocket(socket: Socket) {
    this.sockets.delete(socket);
  }

  addMessage(message: { userId: string; username: string; content: string }) {
    this.messageHistory.push({
      ...message,
      timestamp: new Date().toISOString(),
    });

    // history limit
    if (this.messageHistory.length > this.maxHistory) {
      this.messageHistory.shift();
    }
  }

  getHistory() {
    return [...this.messageHistory];
  }

  getSocketCount(): number {
    return this.sockets.size;
  }

  getRoomId(): string {
    return this.roomId;
  }
}
