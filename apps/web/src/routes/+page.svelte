<script lang="ts">
import { ChessPawnIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/components/ui/button/index.ts";
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b sticky top-0 border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
    <div class="flex h-16 items-center justify-between px-4 w-full">
      <a class="flex items-center gap-2 select-none cursor-pointer" href="/">
        <ChessPawnIcon class="w-7 h-7" />
        <span class="text-xl font-semibold tracking-tight">
          Transcendence
        </span>
      </a>
      <nav class="hidden items-center gap-6 md:flex">
        <p>link1</p>
        <p>link2</p>
      </nav>
      <div class="flex items-center gap-3">
        <a href="/login">
        <Button variant="ghost" size="sm" class="cursor-pointer">
          Log in
        </Button>
        </a>
        <a href="/register">
        <Button size="sm" class="cursor-pointer">Sign up</Button>
        </a>
      </div>
    </div>
  </header>
</div>
