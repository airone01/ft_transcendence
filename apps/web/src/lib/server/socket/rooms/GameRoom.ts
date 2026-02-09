import type { Socket } from "socket.io";
import {
  parseFEN,        // [chess] Parse a FEN string -> GameState
  boardToFEN,      // [chess] Convert a GameState -> FEN string
  playMove,        // [chess] Apply a move to the state and return the new state
  getLegalMoves,   // [chess] Return all legal moves from a square
  isCheckmate,     // [chess] Check if the position is checkmate
  isDraw,          // [chess] Check if the position is a draw (stalemate, etc.)
  isKingInCheck,   // [chess] Check if the current player's king is in check
} from "$lib/chess";
import type { GameState, Move } from "$lib/chess";
import {
  dbUpdateGame,
  dbEndGame,
  type EndGameInput,
} from "$lib/db-services";

// ─── Types ───────────────────────────────────────────────────────────────────

interface MakeMoveInput {
  from: string; // ex: "e2"
  to: string; // ex: "e4"
  promotion?: string;
}

interface MakeMoveResult {
  valid: boolean;
  error?: string;
  fen?: string;
  moveNotation?: string;
  check?: boolean;
  checkmate?: boolean;
  stalemate?: boolean;
  gameOver?: boolean;
  winner?: string | null;
  reason?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert "e2" -> [6, 4] (row, col) */
function algebraicToCoords(pos: string): [number, number] {
  const col = pos.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - parseInt(pos[1]);
  return [row, col];
}

/** Convert [6, 4] -> "e2" */
function coordsToAlgebraic([row, col]: [number, number]): string {
  return String.fromCharCode(col + "a".charCodeAt(0)) + (8 - row);
}

// ─── GameRoom ────────────────────────────────────────────────────────────────

export class GameRoom {
  private gameId: string;
  private state: GameState;
  private whiteId: string;
  private blackId: string;
  private whiteSockets: Set<Socket> = new Set();
  private blackSockets: Set<Socket> = new Set();
  private startTime: Date;
  private lastMoveTime: Date;
  private moveHistory: {
    from: string;
    to: string;
    san?: string;
    timestamp: Date;
  }[] = [];

  constructor(
    gameId: string,
    gameData: {
      whiteId: string;
      blackId: string;
      fen?: string;
      startedAt?: Date;
    }
  ) {
    this.gameId = gameId;
    this.whiteId = gameData.whiteId;
    this.blackId = gameData.blackId;

    // [chess] Initialize the game state from the provided FEN or the starting FEN
    this.state = parseFEN(
      gameData.fen ||
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );

    this.startTime = gameData.startedAt || new Date();
    this.lastMoveTime = this.startTime;
  }

  // ── Players ──────────────────────────────────────────────────────────────

  addPlayer(socket: Socket) {
    const userId = socket.data.userId;
    if (userId === this.whiteId) this.whiteSockets.add(socket);
    else if (userId === this.blackId) this.blackSockets.add(socket);
  }

  removePlayer(socket: Socket) {
    this.whiteSockets.delete(socket);
    this.blackSockets.delete(socket);
  }

  // ── Turn ─────────────────────────────────────────────────────────────────

  isPlayerTurn(userId: string): boolean {
    // [chess] this.state.turn comes from the GameState returned by parseFEN / playMove
    if (this.state.turn === "w") return userId === this.whiteId;
    return userId === this.blackId;
  }

  // ── Move ─────────────────────────────────────────────────────────────────

  async makeMove(
    userId: string,
    input: MakeMoveInput
  ): Promise<MakeMoveResult> {
    try {
      if (!this.isPlayerTurn(userId)) {
        return { valid: false, error: "Not your turn" };
      }

      const from = algebraicToCoords(input.from);
      const to = algebraicToCoords(input.to);

      const move: Move = { from, to };

      // Promotion: map the client's letter to the engine's piece character
      if (input.promotion) {
        const promoMap: Record<string, string> = {
          q: this.state.turn === "w" ? "Q" : "q",
          r: this.state.turn === "w" ? "R" : "r",
          b: this.state.turn === "w" ? "B" : "b",
          n: this.state.turn === "w" ? "N" : "n",
        };
        move.promotion = (promoMap[input.promotion] ||
          null) as Move["promotion"];
      }

      // [chess] Get the list of legal moves from the starting square
      const legalMoves = getLegalMoves(this.state, from);

      // Check if the requested move is in the list returned by the engine
      const isLegal = legalMoves.some(
        (m) =>
          m.to[0] === to[0] &&
          m.to[1] === to[1] &&
          (!move.promotion || m.promotion === move.promotion)
      );

      if (!isLegal) {
        return { valid: false, error: "Illegal move" };
      }

      // [chess] Apply the move to the current state -> return the new state
      this.state = playMove(this.state, move);
      this.lastMoveTime = new Date();

      this.moveHistory.push({
        from: input.from,
        to: input.to,
        timestamp: new Date(),
      });

      // [chess] Check if the new position is a checkmate
      const checkmate = isCheckmate(this.state);

      // [chess] Check if the new position is a draw
      const draw = isDraw(this.state);

      const gameOver = checkmate || draw;

      let winner: string | null = null;
      let reason: string | null = null;

      if (checkmate) {
        winner = userId; // the player who made the checkmate move
        reason = "checkmate";
      } else if (draw) {
        reason = "draw";
      }

      return {
        valid: true,
        // [chess] Convert the current state to FEN to send to the client
        fen: boardToFEN(this.state),
        // [chess] Check if the player who is to move next is in check
        check: !gameOver && this.isCurrentPlayerInCheck(),
        checkmate,
        stalemate: draw && !checkmate,
        gameOver,
        winner,
        reason,
      };
    } catch (error) {
      return { valid: false, error: "Invalid move" };
    }
  }

  // ── State ────────────────────────────────────────────────────────────────

  getState() {
    return {
      gameId: this.gameId,
      // [chess] Convert the state to FEN for the client
      fen: boardToFEN(this.state),
      // [chess] Expose the current turn from the GameState
      turn: this.state.turn,
      // [chess] Check for checkmate on the current position
      isCheckmate: isCheckmate(this.state),
      // [chess] Check for draw on the current position
      isDraw: isDraw(this.state),
    };
  }

  getOpponent(userId: string): string {
    return userId === this.whiteId ? this.blackId : this.whiteId;
  }

  // ── DB ───────────────────────────────────────────────────────────────────

  async endGame(reason: string, winnerId?: string) {
    try {
      let result: "white_win" | "black_win" | "draw" | "abort";

      if (reason === "checkmate") {
        result = winnerId === this.whiteId ? "white_win" : "black_win";
      } else if (reason === "resignation") {
        result = winnerId === this.whiteId ? "white_win" : "black_win";
      } else if (reason === "agreement" || reason === "stalemate") {
        result = "draw";
      } else {
        result = "abort";
      }

      const endGameInput: EndGameInput = {
        gameId: parseInt(this.gameId),
        result,
      };

      await dbEndGame(endGameInput);
    } catch (error) {
      console.error("Failed to end game in DB:", error);
      throw error;
    }
  }

  async saveToDatabase() {
    try {
      const newFen = boardToFEN(this.state);
      await dbUpdateGame(parseInt(this.gameId), newFen);
    } catch (error) {
      console.error("Failed to save game to DB:", error);
      throw error;
    }
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private isCurrentPlayerInCheck(): boolean {
    // [chess] Delegate check verification to the engine
    return isKingInCheck(this.state, this.state.turn === "w");
  }
}