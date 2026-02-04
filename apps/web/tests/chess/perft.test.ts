import { afterAll, describe, expect, test } from "bun:test";
import { boardToFEN, coordsToAlgebraic, parseFEN, playMove } from "$lib/chess";
import { getAllLegalMoves } from "$lib/chess/internal/gameStatus";
import perftPositionsAll from "./perftPositions.json";

const DEBUG = process.env.DEBUG === "1";

let perftPositions = perftPositionsAll;
if (process.env.ALL_PERFT !== "1") {
  perftPositions = perftPositions
    .filter((p) => /^(Initial position|Position \d+)/.test(p.name))
    .map((p) => ({
      ...p,
      depths: p.depths.filter((d) => d.nodes < 100000),
    }));
}

function perft(fen: string, depth: number): number {
  if (depth === 0) return 1;

  const state = parseFEN(fen);
  const moves = getAllLegalMoves(state);
  let nodes = 0;

  for (const move of moves) {
    const newFEN = playMove(state, move);
    nodes += perft(boardToFEN(newFEN), depth - 1);
  }

  return nodes;
}

function _perftDivide(fen: string, depth: number): number {
  if (depth === 0) return 1;

  const moves = getAllLegalMoves(parseFEN(fen));
  let total = 0;

  for (const move of moves) {
    const newFEN = playMove(parseFEN(fen), move);
    const nodes = perft(boardToFEN(newFEN), depth - 1);

    const promotion = move.promotion ? move.promotion.toLowerCase() : "";
    console.log(
      `${coordsToAlgebraic(move.from)}${coordsToAlgebraic(move.to)}${promotion}: ${nodes}`,
    );

    total += nodes;
  }

  return total;
}

let countNodes = 0;
let countTotalNodes = 0;

for (const pos of perftPositions) {
  describe(`${pos.name}`, () => {
    afterAll(() => {
      if (DEBUG) {
        console.log(
          `\x1b[1m\x1b[34mPositions tested:\x1b[0m \x1b[1m${countNodes}\x1b[0m`,
        );
      }
      countNodes = 0;
    });

    for (const d of pos.depths) {
      test(`Depth ${d.d} should return ${d.nodes} nodes`, () => {
        const nodes = perft(pos.fen, d.d);
        countNodes += nodes;
        countTotalNodes += nodes;
        expect(nodes).toBe(d.nodes);
      });
    }
  });
}

afterAll(() => {
  if (DEBUG) {
    console.log(
      `\n\x1b[1m\x1b[34mTotal positions tested:\x1b[0m \x1b[1m${countTotalNodes}\x1b[0m`,
    );
  }
});
