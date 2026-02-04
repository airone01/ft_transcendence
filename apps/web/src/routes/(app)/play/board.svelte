<script lang="ts">
import {ChessPawnIcon, ChessKingIcon, ChessQueenIcon, ChessRookIcon, ChessKnightIcon} from '@lucide/svelte'

import {flip} from "svelte/animate";
import {dndzone, type DndEvent, TRIGGERS} from "svelte-dnd-action";
import type { Component } from "svelte";

type Piece = { id: number; name: string; icon: Component};
type Square = {
  id: number;
  /* we do have to define piece*s* instead of a single piece per square, even
  though there never will be more. This is because of svelte-dnd-action, which
  uses multiple items for a single dndzone. I haven't found a better way to do
  this. */
  pieces: Piece[];
};

let board: Square[] = Array.from({ length: 64 }, (_, i) => ({
  id: i,
  pieces: []
}));

board[0].pieces = [{ id: 101, name: "Rook", icon: ChessRookIcon}];
board[1].pieces = [{ id: 102, name: "Knight", icon: ChessKnightIcon}];
board[9].pieces = [{ id: 103, name: "Pawn", icon: ChessPawnIcon}];

const flipDurationMs = 200;
function handleDndConsider(squareIndex: number, e: CustomEvent<DndEvent<Piece>>) {
  board[squareIndex].pieces = e.detail.items;
  board = [...board]; // trigger reactivity
}

/**
 * @brief handles smooth drag and drop of pieces
 */
function handleDndFinalize(squareIndex: number, e: CustomEvent<DndEvent<Piece>>) {
  const {info, items} = e.detail;

  if (info.trigger === TRIGGERS.DROPPED_INTO_ANOTHER) {
    board[squareIndex].pieces = items;
    board = [...board];
    return;
  }
  
  /* if we have multiple squares in a single zone (a capture), we strictly only
  want the one that was just dropped. */
  if (info.trigger === TRIGGERS.DROPPED_INTO_ZONE) {
    if (items.length > 1) {
      const droppedPiece = items.find(p => String(p.id) === String(info.id));

      if (droppedPiece) {
        // if we found the dropped piece, it becomes the only piece in this square
        board[squareIndex].pieces = [droppedPiece];
      } else {
        // this should never happen but you never know
        console.error("id mismatch. debug info:", { 
          wantedId: info.id, 
          availableIds: items.map(i => i.id) 
        });
        board[squareIndex].pieces = items;
      }
    } else
      // moving out of a square, or dropping in an empty one
      board[squareIndex].pieces = items;
  
    board = [...board]; 
  }
}
</script>

<!-- background-size could be offset by 0.1% to limit the clipping bug of the
conic-gradient, but it does not completely patch it, and it enables
aliasing/blur effect around the squares. So in the end I decided not to. -->
<div 
  class="w-full h-full border relative aspect-square rounded-md max-w-xl grid grid-rows-8 grid-cols-8 *:w-full *:h-full *:p-2 *:aspect-square select-none"
  style:background-image="conic-gradient(var(--secondary) 90deg, var(--primary) 90deg 180deg, var(--secondary) 180deg 270deg, var(--primary) 270deg)"
  style:background-size="25% 25%"
>
  {#each board as square, index (square.id)}
    <div
      use:dndzone={{ items: square.pieces, flipDurationMs, dropTargetStyle: { outline: 'none' } }}
      on:consider={(e) => handleDndConsider(index, e)}
      on:finalize={(e) => handleDndFinalize(index, e)}
    >
      <!-- yes, there could be multiple, because we handle the changes AFTER
      svelte-dnd-action moved the piece there, so we have two pieces in a single
      square/zone. This is also the reason why pieces go down to give space for
      the new one to come. -->
      {#each square.pieces as piece (piece.id)}
        <div animate:flip={{duration: flipDurationMs}} class="cursor-grab active:cursor-grabbing h-full flex justify-center items-center">
          <svelte:component this={piece.icon} class="w-full h-full" />
        </div>
      {/each}
    </div>
  {/each}
</div>

