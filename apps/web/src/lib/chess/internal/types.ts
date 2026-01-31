export type Color = "w" | "b";

export type Piece =
  | "P"
  | "N"
  | "B"
  | "R"
  | "Q"
  | "K"
  | "p"
  | "n"
  | "b"
  | "r"
  | "q"
  | "k"
  | null;

export type Board = Piece[][];

export interface CastlingRights {
  whiteKingSide: boolean;
  whiteQueenSide: boolean;
  blackKingSide: boolean;
  blackQueenSide: boolean;
}

export interface GameState {
  board: Board;
  turn: Color;
  castling: CastlingRights;
  enPassant: [number, number] | null;
  halfMoveCount: number;
  fullMoveCount: number;
}

export interface Move {
  from: [number, number];
  to: [number, number];
  capture?: boolean;
  castle?: "king" | "queen";
  promotion?: Piece;
}
