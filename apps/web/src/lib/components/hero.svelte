<script lang="ts">
import {
  ChessBishopIcon,
  ChessKingIcon,
  ChessKnightIcon,
  ChessPawnIcon,
  ChessQueenIcon,
  ChessRookIcon,
  ChevronRightIcon,
  PlayIcon,
  TrophyIcon,
} from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import type { Component } from "svelte";
import { authState } from "$lib/auth";
import { m } from "$lib/paraglide/messages";
import { openAuthDialog } from "$lib/stores/auth-dialog.svelte.js";

const pieceIconMap: Record<string, Component> = {
  p: ChessPawnIcon,
  n: ChessKnightIcon,
  b: ChessBishopIcon,
  r: ChessRookIcon,
  q: ChessQueenIcon,
  k: ChessKingIcon,
};

const board = [
  ["r", "n", "b", "q", "k", "b", "n", "r"],
  ["p", "p", "p", "p", "p", "p", "p", "p"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["P", "P", "P", "P", "P", "P", "P", "P"],
  ["R", "N", "B", "Q", "K", "B", "N", "R"],
];
</script>

<section
  class="relative mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-16 px-4 py-20 sm:px-6 lg:flex-row lg:gap-8 lg:px-8 md:py-32"
>
  <div
    class="pointer-events-none absolute left-1/2 top-0 -z-10 h-full w-full -translate-x-1/2 overflow-hidden"
  >
    <div
      class="absolute -left-[10%] -top-[20%] h-[50%] w-[50%] rounded-full bg-primary/20 mix-blend-multiply blur-[120px] opacity-70"
    ></div>
    <div
      class="absolute -bottom-[20%] -right-[10%] h-[50%] w-[50%] rounded-full bg-accent/20 mix-blend-multiply blur-[120px] opacity-70"
    ></div>
  </div>

  <div
    class="z-10 flex w-full max-w-2xl flex-1 flex-col items-center text-center lg:items-start lg:text-left"
  >
    <div
      class="mb-8 inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-3 py-1.5 text-sm font-medium backdrop-blur-md"
    >
      <span class="flex h-2 w-2 animate-pulse rounded-full bg-accent"></span>
      {m.landing_page_cta_welcome()}
    </div>

    <h1
      class="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl"
    >
      <span
        class="bg-linear-to-b from-foreground to-foreground/60 bg-clip-text text-transparent"
      >
        {m.hero_page_title()}
      </span>
    </h1>
    <p class="mb-10 max-w-xl text-lg text-muted-foreground sm:text-xl">
      {m.hero_page_desc()}
    </p>

    <div
      class="flex w-full flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
    >
      {#if !authState.isAuthenticated}
        <Button
          size="lg"
          class="group h-14 w-full px-8 text-base sm:w-auto"
          onclick={() => openAuthDialog("register")}
        >
          {m.landing_page_button_register()}
          <ChevronRightIcon
            class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
          />
        </Button>
        <Button
          variant="outline"
          size="lg"
          class="h-14 w-full px-8 text-base sm:w-auto"
          href="#features"
        >
          {m.landing_page_cta_more()}
        </Button>
      {:else}
        <Button
          size="lg"
          class="group h-14 w-full px-8 text-base sm:w-auto"
          href="/play"
        >
          <PlayIcon class="mr-2 h-5 w-5" />
          {m.hero_page_button()}
        </Button>
      {/if}
    </div>
  </div>

  <div class="relative z-10 flex w-full max-w-125 flex-1 justify-center">
    <div
      class="relative aspect-square w-full rounded-2xl bg-secondary/30 p-2 shadow-2xl backdrop-blur-sm transition-transform hover:scale-[1.02]"
      style="transform: perspective(1200px) rotateX(15deg) rotateY(-15deg) rotateZ(5deg);"
    >
      <div
        class="grid h-full w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-xl border border-border/50 shadow-inner"
      >
        {#each board as row, rowIndex}
          {#each row as piece, colIndex}
            <div
              class="flex select-none items-center justify-center text-3xl sm:text-4xl {(rowIndex%2 ^ colIndex%2) ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'}"
            >
              {#if piece}
                {@const isWhite = piece === piece.toUpperCase()}
                {@const Icon = pieceIconMap[piece.toLowerCase()]}
                <div
                  class="w-full h-full flex justify-center items-center p-1.5"
                >
                  <Icon
                    class="w-full h-full {isWhite ? 'stroke-white fill-white/20 drop-shadow-md' : 'stroke-zinc-900 fill-zinc-900/20 drop-shadow-sm'}"
                  />
                </div>
              {/if}
            </div>
          {/each}
        {/each}
      </div>

      <div
        class="absolute -bottom-8 -left-4 hidden items-center gap-4 rounded-xl border border-border bg-background/80 p-5 shadow-2xl backdrop-blur-md sm:-left-12 sm:flex"
        style="transform: translateZ(50px);"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500"
        >
          <TrophyIcon class="h-6 w-6" />
        </div>
        <div>
          <p class="text-sm font-bold">{m.landing_page_cta_join_elite()}</p>
          <p class="text-xs text-muted-foreground">
            {m.landing_page_cta_compete()}
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
