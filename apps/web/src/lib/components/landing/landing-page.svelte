<script lang="ts">
import { ChessPawnIcon, SwordsIcon, UsersIcon, TrophyIcon, BotIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { authState } from "$lib/auth";
import Hero from "$lib/components/hero.svelte";
import { openAuthDialog } from "$lib/stores/auth-dialog.svelte.js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@transc/ui/card";

const features = [
  {
    title: "Ranked Matchmaking",
    description: "Climb the ELO ladder and prove your skills against players of your level.",
    icon: SwordsIcon
  },
  {
    title: "No love for robots!",
    description: "Train your best entry against our advanced bots.",
    icon: BotIcon
  },
  {
    title: "Social Hub",
    description: "Add friends, spectate live games, and challenge your rivals instantly.",
    icon: UsersIcon
  },
  {
    title: "Tournaments",
    description: "Participate in automated tournaments against your friends.",
    icon: TrophyIcon
  }
];
</script>

<div class="min-h-screen flex flex-col bg-background">
  <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
    <div class="container flex h-16 items-center justify-between px-4 mx-auto">
      <div class="flex items-center gap-2 select-none">
        <div class="bg-primary/10 p-2 rounded-lg">
          <ChessPawnIcon class="w-6 h-6 text-primary" />
        </div>
        <span class="text-xl font-bold tracking-tight">
          Transcendence
        </span>
      </div>
      
      <div class="flex items-center gap-4">
        {#if authState.isAuthenticated}
          <form action="/logout" method="POST">
            <Button type="submit" variant="ghost" size="sm">Log out</Button>
          </form>
          <Button href="/home" size="sm">Dashboard</Button>
        {:else}
          <Button onclick={() => openAuthDialog("login")} variant="ghost" size="sm" class="cursor-pointer">Log in</Button>
          <Button onclick={() => openAuthDialog("register")} size="sm" class="cursor-pointer">Sign up</Button>
        {/if}
      </div>
    </div>
  </header>

  <main class="flex-1">
    <Hero />

    <section class="py-24 bg-muted/30">
      <div class="container px-4 md:px-6 mx-auto">
        <div class="text-center mb-16 space-y-4">
          <h2 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Everything you need to <span class="text-primary">Win</span>
          </h2>
          <p class="mx-auto max-w-175 text-muted-foreground md:text-xl">
            Built for performance and designed for clarity.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {#each features as feature}
            <Card class="bg-background/50 backdrop-blur-sm border-muted transition-all hover:-translate-y-1 hover:shadow-md">
              <CardHeader>
                <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <feature.icon class="w-6 h-6" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription class="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          {/each}
        </div>
      </div>
    </section>
  </main>

  <footer class="border-t py-12 bg-background">
    <div class="container px-4 flex flex-col md:flex-row justify-between items-center gap-6 mx-auto">
      <div class="flex items-center gap-2">
        <ChessPawnIcon class="w-5 h-5 text-muted-foreground" />
        <p class="text-sm text-muted-foreground">© 2026 Transcendence. All rights reserved.</p>
      </div>
      <div class="flex gap-6 text-sm text-muted-foreground">
        <a href="/privacy" class="hover:text-foreground">Privacy</a>
        <a href="/terms" class="hover:text-foreground">Terms</a>
      </div>
    </div>
  </footer>
</div>
