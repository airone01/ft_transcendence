<script lang="ts">
import IconChessFilled from "virtual:icons/tabler/chess-filled";
import { Button } from "@transc/ui/components/ui/button/index.ts";
import Hero from "./hero.svelte";
</script>

<div class="min-h-screen flex flex-col">
  <header class="border-b sticky top-0 border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
    <div class="flex h-16 items-center justify-between px-4 w-full">
      <a class="flex items-center gap-2 select-none cursor-pointer" href="/">
        <IconChessFilled class="w-7 h-7" />
        <span class="text-xl font-semibold tracking-tight">
          Transcendence
        </span>
      </a>
      <nav class="hidden items-center gap-6 md:flex">
        <!-- <a>link1</a> -->
        <!-- <a>link2</a> -->
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
  <main class="flex-1 flex flex-col justify-center items-center">
    <Hero />
  </main>
</div>
