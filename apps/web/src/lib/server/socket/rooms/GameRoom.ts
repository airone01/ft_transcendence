import type { Socket } from "socket.io";
import {
  parseFEN,        // [chess] Parse un FEN string -> GameState
  boardToFEN,      // [chess] Convertit un GameState -> FEN string
  playMove,        // [chess] Applique un coup sur l'état et retourne le nouvel état
  getLegalMoves,   // [chess] Retourne tous les coups légaux depuis une case
  isCheckmate,     // [chess] Vérifie si la position est un échec et mat
  isDraw,          // [chess] Vérifie si la position est un nul (stalemate, etc.)
  isKingInCheck,   // [chess] Vérifie si le roi du joueur actuel est en échec
} from "$lib/chess";
import type { GameState, Move } from "$lib/chess";
import { db } from "@transc/db";
import { game as gameTable } from "@transc/db/schema";
import { eq } from "drizzle-orm";

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

/** Convertit "e2" -> [6, 4] (row, col) */
function algebraicToCoords(pos: string): [number, number] {
  const col = pos.charCodeAt(0) - "a".charCodeAt(0);
  const row = 8 - parseInt(pos[1]);
  return [row, col];
}

/** Convertit [6, 4] -> "e2" */
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

    // [chess] Initialise l'état de la partie depuis le FEN fourni ou le FEN de départ
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
    // [chess] this.state.turn vient du GameState retourné par parseFEN / playMove
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

      // Promotion : mappe la lettre du client vers le caractère de pièce du moteur
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

      // [chess] Récupère la liste des coups légaux depuis la case d'origine
      const legalMoves = getLegalMoves(this.state, from);

      // Vérifie si le coup demandé est dans la liste retournée par le moteur
      const isLegal = legalMoves.some(
        (m) =>
          m.to[0] === to[0] &&
          m.to[1] === to[1] &&
          (!move.promotion || m.promotion === move.promotion)
      );

      if (!isLegal) {
        return { valid: false, error: "Illegal move" };
      }

      // [chess] Applique le coup sur l'état actuel -> retourne le nouvel état
      this.state = playMove(this.state, move);
      this.lastMoveTime = new Date();

      this.moveHistory.push({
        from: input.from,
        to: input.to,
        timestamp: new Date(),
      });

      // [chess] Vérifie si la nouvelle position est un échec et mat
      const checkmate = isCheckmate(this.state);

      // [chess] Vérifie si la nouvelle position est un nul
      const draw = isDraw(this.state);

      const gameOver = checkmate || draw;

      let winner: string | null = null;
      let reason: string | null = null;

      if (checkmate) {
        winner = userId; // celui qui a joué le coup qui met mat
        reason = "checkmate";
      } else if (draw) {
        reason = "draw";
      }

      return {
        valid: true,
        // [chess] Convertit l'état actuel en FEN pour l'envoyer au client
        fen: boardToFEN(this.state),
        // [chess] Vérifie si le joueur qui doit jouer ensuite est en échec
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
      // [chess] Convertit l'état en FEN pour le client
      fen: boardToFEN(this.state),
      // [chess] Expose le tour actuel depuis le GameState
      turn: this.state.turn,
      // [chess] Vérifie checkmate sur la position actuelle
      isCheckmate: isCheckmate(this.state),
      // [chess] Vérifie nul sur la position actuelle
      isDraw: isDraw(this.state),
    };
  }

  getOpponent(userId: string): string {
    return userId === this.whiteId ? this.blackId : this.whiteId;
  }

  // ── DB ───────────────────────────────────────────────────────────────────

  async endGame(reason: string, winnerId?: string) {
    await db
      .update(gameTable)
      .set({
        status: "finished",
        winnerId: winnerId ? parseInt(winnerId) : null,
        endReason: reason as any,
        finishedAt: new Date(),
        pgn: this.moveHistory.map((m) => `${m.from}${m.to}`).join(" "),
      })
      .where(eq(gameTable.id, parseInt(this.gameId)));
  }

  async saveToDatabase() {
    await db
      .update(gameTable)
      .set({
        // [chess] Sauvegarde le FEN actuel en DB
        fen: boardToFEN(this.state),
        moveCount: this.moveHistory.length,
      })
      .where(eq(gameTable.id, parseInt(this.gameId)));
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private isCurrentPlayerInCheck(): boolean {
    // [chess] Délègue la vérification d'échec au moteur
    return isKingInCheck(this.state, this.state.turn === "w");
  }
}