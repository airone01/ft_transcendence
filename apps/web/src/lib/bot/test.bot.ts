import {
  isCheckmate,
  isDraw,
  playMove,
  printBoard,
  printHistory,
  startGame,
} from "$lib/chess";
import { findBestMoveTimed } from "./bot.claude";

function testBot() {
  let state = startGame();

  console.log("Starting game");
  printBoard(state.board);
  console.log("");

  while (!isCheckmate(state) && !isDraw(state)) {
    const startClock = Date.now();
    console.log(state.turn === "w" ? "White's turn" : "Black's turn");

    const move = findBestMoveTimed(state, 3000);
    state = playMove(state, move);

    printBoard(state.board);

    console.log("Time taken: " + (Date.now() - startClock) + "ms");
    console.log("");
  }

  if (isCheckmate(state)) {
    console.log(
      "Checkmate! " + (state.turn === "b" ? "White" : "Black") + " wins!",
    );
  } else if (isDraw(state)) {
    console.log("Draw!");
  }
}

testBot();
process.exit(0);
