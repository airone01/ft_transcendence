import { EventEmitter } from "node:events";
import type { Socket } from "socket.io";
import type { GameState, Move } from "$lib/chess";
import {
  boardToFEN, // [chess] Convert a GameState -> FEN string
  isCheckmate, // [chess] Check if the position is checkmate
  isDraw, // [chess] Check if the position is a draw (stalemate, etc.)
  parseFEN, // [chess] Parse a FEN string -> GameState
  playMove, // [chess] Apply a move to the state and return the new state
  startGame, // [chess] Start a new game
} from "$lib/chess";
import { dbEndGame, type EndGameInput } from "$lib/server/db-services";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MakeMoveInput {
  from: string;
  to: string;
  promotion?: string;
}

interface MakeMoveResult {
  valid: boolean;
  error?: string;
  fen?: string;
  moveNotation?: string;
  checkmate?: boolean;
  stalemate?: boolean;
  gameOver?: boolean;
  winner?: string | null;
  reason?: string | null;
  whiteTimeLeft?: number;
  blackTimeLeft?: number;
}

function algebraicToCoords(pos: string): [number, number] {
  const col = pos.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - parseInt(pos[1], 10);
  return [row, col];
}

function _coordsToAlgebraic([row, col]: [number, number]): string {
  return String.fromCharCode(col + "a".charCodeAt(0)) + (8 - row);
}

export class GameRoom extends EventEmitter {
  // Game identity
  private gameId: string;
  public whiteId: string;
  public blackId: string;

  // Chess state
  private state: GameState;
  private moveHistory: {
    from: string;
    to: string;
    san?: string;
    timestamp: Date;
  }[] = [];

  // Players sockets
  private whiteSockets: Set<Socket> = new Set();
  private blackSockets: Set<Socket> = new Set();

  private startTime: Date;
  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: will be used later
  private lastMoveTime: Date;
  private whiteTimeLeft: number;
  private blackTimeLeft: number;
  private timeControlSeconds: number;
  private incrementSeconds: number;

  // Timer management
  private activeTimer: NodeJS.Timeout | null = null;
  private lastTimerStart: number = 0;

  // Game over flag
  private isGameOverFlag: boolean = false;

  constructor(
    gameId: string,
    gameData: {
      whiteId: string;
      blackId: string;
      fen?: string;
      startedAt?: Date;
      timeControlSeconds?: number;
      incrementSeconds?: number;
      whiteTimeLeft?: number;
      blackTimeLeft?: number;
    },
  ) {
    super();

    this.gameId = gameId;
    this.whiteId = gameData.whiteId;
    this.blackId = gameData.blackId;

    if (gameData.fen) {
      this.state = parseFEN(gameData.fen);
      console.log(`[GameRoom ${gameId}] Restored FEN: ${gameData.fen}`);
    } else {
      this.state = startGame();
      console.log(`[GameRoom ${gameId}] Started new game`);
    }

    this.startTime = gameData.startedAt || new Date();
    this.lastMoveTime = this.startTime;

    this.timeControlSeconds = gameData.timeControlSeconds || 600;
    this.incrementSeconds = gameData.incrementSeconds || 5;

    this.whiteTimeLeft =
      gameData.whiteTimeLeft ?? this.timeControlSeconds * 1000;
    this.blackTimeLeft =
      gameData.blackTimeLeft ?? this.timeControlSeconds * 1000;

    console.log(
      `[GameRoom ${gameId}] Times: white=${this.whiteTimeLeft}ms, black=${this.blackTimeLeft}ms`,
    );
  }

  // Players Management

  addPlayer(socket: Socket) {
    const userId = socket.data.userId;
    if (userId === this.whiteId) this.whiteSockets.add(socket);
    else if (userId === this.blackId) this.blackSockets.add(socket);
  }

  removePlayer(socket: Socket) {
    this.whiteSockets.delete(socket);
    this.blackSockets.delete(socket);
  }

  hasPlayer(socket: Socket): boolean {
    return this.whiteSockets.has(socket) || this.blackSockets.has(socket);
  }

  // Turn Management

  isPlayerTurn(userId: string): boolean {
    if (this.state.turn === "w") return userId === this.whiteId;
    return userId === this.blackId;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Timer Management
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  startTimer() {
    if (this.isGameOverFlag) return;

    this.stopTimer();
    this.lastTimerStart = Date.now();

    this.activeTimer = setInterval(() => {
      const elapsed = Date.now() - this.lastTimerStart;
      this.lastTimerStart = Date.now();

      if (this.state.turn === "w") {
        this.whiteTimeLeft -= elapsed;
        if (this.whiteTimeLeft <= 0) {
          this.whiteTimeLeft = 0;
          this.handleTimeout("w");
          return;
        }
      } else {
        this.blackTimeLeft -= elapsed;
        if (this.blackTimeLeft <= 0) {
          this.blackTimeLeft = 0;
          this.handleTimeout("b");
          return;
        }
      }

      this.emit("time_tick", {
        whiteTimeLeft: this.whiteTimeLeft,
        blackTimeLeft: this.blackTimeLeft,
      });
    }, 100);

    console.log(
      `[GameRoom ${this.gameId}] Timer started for ${this.state.turn === "w" ? "white" : "black"}`,
    );
  }

  stopTimer() {
    if (this.activeTimer) {
      const elapsed = Date.now() - this.lastTimerStart;

      if (this.state.turn === "w") {
        this.whiteTimeLeft -= elapsed;
      } else {
        this.blackTimeLeft -= elapsed;
      }

      clearInterval(this.activeTimer);
      this.activeTimer = null;

      console.log(`[GameRoom ${this.gameId}] Timer stopped`);
    }
  }

  async handleTimeout(color: "w" | "b") {
    if (this.isGameOverFlag) return;

    this.stopTimer();
    this.isGameOverFlag = true;

    const winner = color === "w" ? this.blackId : this.whiteId;

    console.log(
      `[GameRoom ${this.gameId}] Timeout: ${color === "w" ? "white" : "black"} ran out of time`,
    );

    await this.endGame("timeout", winner);

    this.emit("timeout", { winner, gameId: this.gameId });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Move Execution
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  async makeMove(
    userId: string,
    input: MakeMoveInput,
  ): Promise<MakeMoveResult> {
    this.stopTimer();

    try {
      const from = algebraicToCoords(input.from);
      const to = algebraicToCoords(input.to);

      const move: Move = { from, to };

      // Déterminer la couleur depuis la pièce qui bouge
      const piece = this.state.board[from[0]][from[1]];
      if (!piece) {
        this.startTimer();
        return { valid: false, error: "No piece at source square" };
      }

      const isWhite = piece === piece.toUpperCase();

      // Promotion
      if (input.promotion) {
        const promoMap: Record<string, string> = {
          q: isWhite ? "Q" : "q",
          r: isWhite ? "R" : "r",
          b: isWhite ? "B" : "b",
          n: isWhite ? "N" : "n",
        };
        move.promotion = (promoMap[input.promotion.toLowerCase()] ||
          null) as Move["promotion"];
      }

      this.state = playMove(this.state, move);
      this.lastMoveTime = new Date();

      this.moveHistory.push({
        from: input.from,
        to: input.to,
        timestamp: new Date(),
      });

      if (userId === this.whiteId) {
        this.whiteTimeLeft += this.incrementSeconds * 1000;
      } else {
        this.blackTimeLeft += this.incrementSeconds * 1000;
      }

      console.log(
        `[GameRoom ${this.gameId}] Move: ${input.from}→${input.to}, times: white=${this.whiteTimeLeft}ms, black=${this.blackTimeLeft}ms`,
      );

      const checkmate = isCheckmate(this.state);
      const draw = isDraw(this.state);
      const gameOver = checkmate || draw;

      let winner: string | null = null;
      let reason: string | null = null;

      if (checkmate) {
        this.isGameOverFlag = true;
        winner = userId;
        reason = "checkmate";
      } else if (draw) {
        this.isGameOverFlag = true;
        reason = "draw";
      }

      if (gameOver) {
        await this.endGame(reason || "unknown", winner || undefined);

        // Émettre événement
        this.emit("game_over", { winner, reason, gameId: this.gameId });
      } else {
        // Redémarrer le timer pour le joueur suivant
        this.startTimer();
      }

      return {
        valid: true,
        fen: boardToFEN(this.state),
        checkmate,
        stalemate: draw && !checkmate,
        gameOver,
        winner,
        reason,
        whiteTimeLeft: this.whiteTimeLeft,
        blackTimeLeft: this.blackTimeLeft,
      };
    } catch (error) {
      console.error(`[GameRoom ${this.gameId}] Move error:`, error);
      this.startTimer();
      return { valid: false, error: "Invalid move" };
    }
  }

  // State Access

  getState() {
    return {
      gameId: this.gameId,
      fen: boardToFEN(this.state),
      turn: this.state.turn,
      isCheckmate: isCheckmate(this.state),
      isDraw: isDraw(this.state),
      whiteTimeLeft: this.whiteTimeLeft,
      blackTimeLeft: this.blackTimeLeft,
    };
  }

  getCurrentFEN(): string {
    return boardToFEN(this.state);
  }

  getWhiteTimeLeft(): number {
    return this.whiteTimeLeft;
  }

  getBlackTimeLeft(): number {
    return this.blackTimeLeft;
  }

  getMoveHistory(): typeof this.moveHistory {
    return [...this.moveHistory];
  }

  getOpponent(userId: string): string {
    return userId === this.whiteId ? this.blackId : this.whiteId;
  }

  isGameOver(): boolean {
    return this.isGameOverFlag;
  }

  // Database Operations

  async endGame(reason: string, winnerId?: string) {
    if (
      this.isGameOverFlag &&
      reason !== "timeout" &&
      reason !== "checkmate" &&
      reason !== "draw"
    ) {
      // Éviter double-call sauf si vient de timeout/checkmate/draw
      console.log(
        `[GameRoom ${this.gameId}] Game already ended, skipping endGame()`,
      );
      return;
    }

    this.stopTimer();
    this.isGameOverFlag = true;

    try {
      let result: "white_win" | "black_win" | "draw" | "abort";

      if (
        reason === "checkmate" ||
        reason === "resignation" ||
        reason === "timeout"
      ) {
        result = winnerId === this.whiteId ? "white_win" : "black_win";
      } else if (
        reason === "agreement" ||
        reason === "stalemate" ||
        reason === "draw" ||
        reason === "insufficient_material" ||
        reason === "threefold_repetition" ||
        reason === "fifty_move_rule"
      ) {
        result = "draw";
      } else {
        result = "abort";
      }

      const endGameInput: EndGameInput = {
        gameId: parseInt(this.gameId, 10),
        result,
      };

      await dbEndGame(endGameInput);

      console.log(
        `[GameRoom ${this.gameId}] Game ended and saved to DB: ${reason}, result: ${result}`,
      );
    } catch (error) {
      console.error(
        `[GameRoom ${this.gameId}] Failed to end game in DB:`,
        error,
      );
      throw error;
    }
  }

  // Cleanup
  cleanup() {
    this.stopTimer();
    this.removeAllListeners();
    console.log(`[GameRoom ${this.gameId}] Cleaned up`);
  }
}
