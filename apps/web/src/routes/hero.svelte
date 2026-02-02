<script>
import Button from "@transc/ui/components/ui/button/button.svelte";
</script>

<section class="flex gap-4 container">
  <!-- Main title -->
  <div class="flex flex-col justify-center items-center w-full">
    <h1 class="text-7xl uppercase font-semibold text-center">Play Chess Now</h1>
  </div>
  <!-- Chess board -->
  <div class="flex flex-col justify-center items-center w-full relative">
    <div class="grid grid-cols-8 grid-rows-8 aspect-square w-full max-w-md border">
      {#each {length: 8}, row}
        {#each {length: 8}, col}
          <div class={(row%2 ^ col%2) ? 'bg-foreground/80' : 'bg-white'}></div>
        {/each}
      {/each}
    </div>
    
    <a href="/home">
      <Button
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
        aria-label="Start new game"
      >
        New game
      </Button>
    </a>
  </div>
</section>

