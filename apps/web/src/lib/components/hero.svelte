<script lang="ts">
import { ChevronRightIcon, PlayIcon, TrophyIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { authState } from "$lib/auth";
import * as m from "$lib/paraglide/messages.js";
import { openAuthDialog } from "$lib/stores/auth-dialog.svelte.js";

// A standard 8x8 starting chess board using Unicode characters
const board = [
  ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"],
  ["♟", "♟", "♟", "♟", "♟", "♟", "♟", "♟"],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", ""],
  ["♙", "♙", "♙", "♙", "♙", "♙", "♙", "♙"],
  ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"],
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

    <p
      class="mb-10 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl"
    >
      {m.hero_page_desc()}
    </p>

    <div class="flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
      {#if authState.isAuthenticated}
        <Button
          href="/"
          size="lg"
          class="group h-14 w-full px-8 text-base shadow-xl shadow-primary/20 transition-all hover:scale-105 sm:w-auto"
        >
          <PlayIcon class="mr-2 h-5 w-5 fill-current" />
          {m.hero_page_button()}
        </Button>
      {:else}
        <Button
          onclick={() => openAuthDialog("register")}
          size="lg"
          class="group h-14 w-full px-8 text-base shadow-xl shadow-primary/20 transition-all hover:scale-105 sm:w-auto"
        >
          {m.landing_page_button_register()}
        </Button>
      {/if}

      <Button
        href="#features"
        variant="outline"
        size="lg"
        class="group h-14 w-full px-8 text-base sm:w-auto"
      >
        {m.landing_page_cta_more()}
        <ChevronRightIcon
          class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
        />
      </Button>
    </div>
  </div>

  <div
    class="relative z-10 mt-10 flex w-full max-w-lg flex-1 justify-center lg:mt-0 lg:max-w-none"
  >
    <div
      class="relative aspect-square w-full max-w-120 rounded-2xl border border-border/40 bg-background/40 p-4 shadow-2xl backdrop-blur-xl transition-transform duration-700 hover:scale-[1.02]"
      style="transform: perspective(1200px) rotateX(15deg) rotateY(-15deg) rotateZ(5deg);"
    >
      <div
        class="grid h-full w-full grid-cols-8 grid-rows-8 overflow-hidden rounded-xl border border-border/50 shadow-inner"
      >
        {#each board as row, rowIndex}
          {#each row as piece, colIndex}
            <div
              class="flex select-none items-center justify-center text-3xl sm:text-4xl {(rowIndex%2 ^ colIndex%2) ? 'bg-secondary/60' : 'bg-primary/80'}"
            >
              {#if piece}
                <span
                  class={rowIndex < 2 ? 'text-black drop-shadow-sm' : 'text-white drop-shadow-md'}
                >
                  {piece}
                </span>
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
          <p class="text-sm font-semibold">{m.landing_page_cta_join_elite()}</p>
          <p class="text-xs text-muted-foreground">
            {m.landing_page_cta_compete()}
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
