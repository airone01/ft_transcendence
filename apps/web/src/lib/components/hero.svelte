<script lang="ts">
import { Button } from "@transc/ui/button";
import { ArrowRightIcon, ChessBishopIcon, ChessKingIcon, ChessKnightIcon, ChessPawnIcon, ChessQueenIcon, ChessRookIcon } from "@lucide/svelte";
import type { Component } from "svelte";
import { openAuthDialog } from "$lib/stores/auth-dialog.svelte";

function getPiece(row: number, col: number): Component {
  if (row == 0 || row == 7) {
    if (col == 0 || col == 7)
      return ChessRookIcon;
    if (col == 1 || col == 6)
      return ChessKnightIcon;
    if (col == 2 || col == 5)
      return ChessBishopIcon;
    if (col == 3)
      return ChessQueenIcon;
    return ChessKingIcon;
  }
  return ChessPawnIcon;
}
</script>

<section class="relative overflow-hidden py-20 lg:py-32">
  <div aria-hidden="true" class="absolute -top-96 start-1/2 flex -translate-x-1/2 transform -z-10">
    <div class="bg-linear-to-r from-primary/20 to-secondary/20 blur-3xl w-7xl h-160 rounded-full opacity-50"></div>
  </div>

  <div class="container px-4 md:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
    <div class="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 flex-1">
      <div class="space-y-4">
        <h1 class="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter">
          Master the Game <br class="hidden lg:block" />
          <span class="text-transparent bg-clip-text bg-linear-to-r from-amber-600 to-purple-600">
            Transcend Limits
          </span>
        </h1>
        <p class="text-xl text-muted-foreground max-w-150 mx-auto lg:mx-0">
          Experience chess like never before. Real-time matchmaking, advanced analysis, 
          and a vibrant community waiting for your move.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <Button size="lg" onclick={() => openAuthDialog("register")} class="gap-2 shadow-lg shadow-primary/20 cursor-pointer">
          Log in <ArrowRightIcon class="h-4 w-4" />
        </Button>
        <Button size="lg" variant="outline" onclick={() => openAuthDialog("register")} class="cursor-pointer">
          Create Account
        </Button>
      </div>
      
      <div class="flex gap-8 text-sm text-muted-foreground pt-4">
        <div class="flex flex-col">
          <span class="font-bold text-foreground text-xl">10+</span>
          <span>Games Played</span>
        </div>
        <div class="border-l pl-8 flex flex-col">
          <span class="font-bold text-foreground text-xl">Active</span>
          <span>Community</span>
        </div>
      </div>
    </div>

    <div class="flex-1 w-full max-w-md lg:max-w-full relative perspective-[1000px] group">
      <div 
        class="relative mx-auto w-full aspect-square max-w-125 transform transition-transform duration-700 ease-out group-hover:rotate-x-12 group-hover:rotate-y-12 rotate-x-6 rotate-z-[-10deg] shadow-2xl rounded-xl border-8 border-neutral-800 bg-neutral-900"
        style="transform-style: preserve-3d;"
      >
        <div class="grid grid-cols-8 grid-rows-8 hero.svelteh-full w-full rounded-sm overflow-hidden">
          {#each {length: 8}, row}
            {#each {length: 8}, col}
              <div 
                class="w-full h-full flex items-center justify-center relative aspect-square"
                class:bg-[#ebecd0]={(row + col) % 2 === 0}
                class:bg-[#779556]={(row + col) % 2 !== 0}
              >
                {#if (row < 2 || row > 5)}
                  {@const Piece = getPiece(row, col)}
                  <Piece class={`h-3/5 w-full fill-current/30 ${row > 5 ? "text-white" : "text-black"}`} />
                {/if}
              </div>
            {/each}
          {/each}
        </div>
      </div>
      
      <div class="absolute -bottom-12 -right-12 -z-10 w-64 h-64 bg-primary/30 rounded-full blur-3xl"></div>
      <div class="absolute -top-12 -left-12 -z-10 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"></div>
    </div>
  </div>
</section>
