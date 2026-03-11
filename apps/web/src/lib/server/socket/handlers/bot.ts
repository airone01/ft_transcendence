import type { Server, Socket } from "socket.io";
import { parseFEN } from "$lib/chess";
import { findBestMoveTimed } from "../../chessBot/internal/bot/main";
import { GameRoom } from "../rooms/GameRoom";
import { activeGames } from "./game";
import { m } from "$lib/paraglide/messages"; 

export const BOT_USER_ID = "0";
export const MAX_BOT_GAMES = 2;

let activeBotGamesCount = 0;
const botQueue: Array<{ userId: string; socket: Socket; difficulty: string }> =
  [];

function coordsToAlgebraic(coords: [number, number]): string {
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  return files[coords[1]] + ranks[coords[0]];
}

function decrementBotGames() {
  activeBotGamesCount--;
  console.log(`[Bot] Active games: ${activeBotGamesCount}/${MAX_BOT_GAMES}`);
}

function incrementBotGames() {
  activeBotGamesCount++;
  console.log(`[Bot] Active games: ${activeBotGamesCount}/${MAX_BOT_GAMES}`);
}

function startNextBotGame(io: Server) {
  if (activeBotGamesCount >= MAX_BOT_GAMES || botQueue.length === 0) {
    return;
  }

  const player = botQueue.shift();
  if (!player) return;

  const { userId, socket } = player;

  incrementBotGames();
  console.log(
    `[Bot Queue] Starting game for user ${userId}, queue remaining: ${botQueue.length}`,
  );

  const gameId = `bot-${userId}-${Date.now()}`;

  try {
    const gameRoom = new GameRoom(gameId, {
      whiteId: userId,
      blackId: BOT_USER_ID,
      timeControlSeconds: 600,
      incrementSeconds: 5,
      startedAt: new Date(),
    });

    activeGames.set(gameId, gameRoom);

    gameRoom.on(
      "time_tick",
      (data: { whiteTimeLeft: number; blackTimeLeft: number }) => {
        socket.emit("game:time", data);
      },
    );

    gameRoom.on("timeout", (data: { winner: string; gameId: string }) => {
      socket.emit("game:over", {
        winner: data.winner === userId ? "white" : "black",
        winnerName: data.winner === userId ? socket.data.username : "Bot",
        reason: "timeout",
        eloChange: null,
      });

      activeGames.delete(data.gameId);
      decrementBotGames();
      startNextBotGame(io);
    });

    socket.join(`game:${gameId}`);
    socket.data.currentGameId = gameId;

    setTimeout(() => {
      socket.emit("game:state", {
        ...gameRoom.getState(),
        myColor: "white",
        isBotGame: true,
      });
    }, 200);

    console.log(`[Bot] Game ${gameId} created for user ${userId}`);
  } catch (error) {
    decrementBotGames();
    console.error("[Bot] Failed to create game:", error);
    socket.emit("game:error", { message: "Failed to start bot game" });
    startNextBotGame(io);
  }
}

export function releaseBotGame(gameId: string, io: Server) {
  const gameRoom = activeGames.get(gameId);
  if (gameRoom) {
    gameRoom.stopTimer();
    activeGames.delete(gameId);
    decrementBotGames();
    console.log(`[Bot] Game ${gameId} released`);
    startNextBotGame(io);
  }
}

export function registerBotHandlers(io: Server, socket: Socket) {
  const userId = socket.data.userId;

  socket.on("bot:start", async (data: { difficulty: string }) => {
    const { difficulty } = data;

    const alreadyInQueue = botQueue.some((p) => p.userId === userId);
    if (alreadyInQueue) {
      return socket.emit("game:error", { message: "Already in bot queue" });
    }

    if (socket.data.currentGameId?.startsWith("bot-")) {
      return socket.emit("game:error", { message: "Already in a bot game" });
    }

    botQueue.push({ userId, socket, difficulty });
    console.log(
      `[Bot Queue] User ${userId} added, total in queue: ${botQueue.length}`,
    );

    if (activeBotGamesCount < MAX_BOT_GAMES) {
      startNextBotGame(io);
    } else {
      socket.emit("bot:waiting", {
        message: "Waiting for available slot...",
      });
    }
  });

  socket.on("bot:cancel", () => {
    const index = botQueue.findIndex((p) => p.userId === userId);
    if (index !== -1) {
      botQueue.splice(index, 1);
      console.log(
        `[Bot Queue] User ${userId} cancelled, remaining: ${botQueue.length}`,
      );
      socket.emit("bot:cancelled");
    }
  });

  socket.on("bot:quit", (data: { gameId: string }) => {
    const { gameId } = data;

    if (!gameId.startsWith("bot-")) {
      return socket.emit("game:error", { message:  m.socket_bot_quit_error() });
    }

    releaseBotGame(gameId, io);
    socket.leave(`game:${gameId}`);
    socket.data.currentGameId = null;
    socket.emit("bot:quit_success");
  });

  socket.on(
    "bot:move",
    async (data: {
      gameId: string;
      from: string;
      to: string;
      promotion?: string;
    }) => {
      try {
        const { gameId, from, to, promotion } = data;
        const gameRoom = activeGames.get(gameId);

        if (!gameRoom) {
          return socket.emit("game:error", { message: m.socket_bot_move_game_error() });
        }

        const result = await gameRoom.makeMove(userId, { from, to, promotion });

        if (!result.valid) {
          return socket.emit("game:error", { message: result.error });
        }

        socket.emit("game:move", {
          from,
          to,
          promotion,
          fen: result.fen,
          checkmate: result.checkmate,
          stalemate: result.stalemate,
          whiteTimeLeft: result.whiteTimeLeft,
          blackTimeLeft: result.blackTimeLeft,
        });

        if (result.gameOver) {
          socket.emit("game:over", {
            winner: result.winner === userId ? "white" : "black",
            reason: result.reason,
          });

          releaseBotGame(gameId, io);
          return;
        }

        const currentFen = gameRoom.getState().fen;
        const currentGameState = parseFEN(currentFen);
        const botMove = findBestMoveTimed(currentGameState);

        if (botMove) {
          const fromAlgebraic = coordsToAlgebraic(botMove.from);
          const toAlgebraic = coordsToAlgebraic(botMove.to);

          const botResult = await gameRoom.makeMove(BOT_USER_ID, {
            from: fromAlgebraic,
            to: toAlgebraic,
            promotion: botMove.promotion?.toLowerCase(),
          });

          socket.emit("game:move", {
            from: fromAlgebraic,
            to: toAlgebraic,
            promotion: botMove.promotion?.toLowerCase(),
            fen: botResult.fen,
            checkmate: botResult.checkmate,
            stalemate: botResult.stalemate,
            whiteTimeLeft: botResult.whiteTimeLeft,
            blackTimeLeft: botResult.blackTimeLeft,
          });

          if (botResult.gameOver) {
            socket.emit("game:over", {
              winner: botResult.winner === userId ? "white" : "black",
              reason: botResult.reason,
            });

            releaseBotGame(gameId, io);
          }
        }
      } catch (error) {
        console.error("[Bot] Move error:", error);
        socket.emit("game:error", { message: m.socket_bot_move_error() });
      }
    },
  );
}
