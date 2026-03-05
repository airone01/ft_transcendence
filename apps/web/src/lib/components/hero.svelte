<script>
import { Button } from "@transc/ui/button";
import * as m from "$lib/paraglide/messages.js";
</script>

<section
  class="flex flex-col-reverse sm:flex-row gap-6 sm:gap-4 container px-4"
>
  <!-- Main title -->
  <div class="flex flex-col justify-center items-center w-full">
    <h1
      class="text-4xl sm:text-5xl lg:text-7xl uppercase font-semibold text-center"
    >
      {m.hero_page_title()}
    </h1>
  </div>
  <!-- Chess board -->
  <div class="flex flex-col justify-center items-center w-full relative">
    <div
      class="grid grid-cols-8 grid-rows-8 aspect-square w-full max-w-md border rounded-md overflow-hidden"
    >
      {#each {length: 8}, row}
        {#each {length: 8}, col}
          <div class={(row%2 ^ col%2) ? 'bg-secondary' : 'bg-primary'}></div>
        {/each}
      {/each}
    </div>

    <Button
      variant="outline"
      href="/play"
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      aria-label="Start new game"
    >
      {m.hero_page_button()}
    </Button>
  </div>
</section>
