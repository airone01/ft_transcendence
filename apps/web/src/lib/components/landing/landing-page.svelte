<script lang="ts">
import {
  ChessPawnIcon,
  SwordsIcon,
  TrophyIcon,
  UsersIcon,
} from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { authState } from "$lib/auth";
import Hero from "$lib/components/hero.svelte";
import * as m from "$lib/paraglide/messages.js";
import { openAuthDialog } from "$lib/stores/auth-dialog.svelte.js";
import LanguageSwitcher from "../language-switcher.svelte";
import ModeToggle from "../mode-toggle.svelte";

const features = [
  {
    title: m.landing_page_feats_multiplayer_title(),
    description: m.landing_page_feats_multiplayer_desc(),
    icon: SwordsIcon,
  },
  {
    title: m.landing_page_feats_multiplayer_title(),
    description: m.landing_page_feats_elo_desc(),
    icon: TrophyIcon,
  },
  {
    title: m.landing_page_feats_social_title(),
    description: m.landing_page_feats_social_desc(),
    icon: UsersIcon,
  },
];
</script>

<div
  class="relative flex min-h-screen flex-col bg-background selection:bg-primary/20"
>
  <header
    class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
  >
    <div
      class="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8"
    >
      <a
        href="/"
        class="flex items-center gap-2.5 transition-opacity hover:opacity-80"
      >
        <ChessPawnIcon class="h-6 w-6 text-primary" />
        <span class="text-lg font-semibold tracking-tight">
          {m.project_name()}
        </span>
      </a>

      <div class="flex items-center gap-3 sm:gap-4">
        {#if authState.isAuthenticated}
          <Button
            href="/"
            variant="default"
            size="sm"
            class="hidden sm:inline-flex"
          >
            {m.hero_page_button()}
          </Button>
          <form action="/logout" method="POST">
            <Button type="submit" variant="ghost" size="sm">
              {m.landing_page_button_logout()}
            </Button>
          </form>
        {:else}
          <Button
            onclick={() => openAuthDialog("login")}
            variant="ghost"
            size="sm"
          >
            {m.landing_page_button_login()}
          </Button>
          <Button
            onclick={() => openAuthDialog("register")}
            variant="default"
            size="sm"
          >
            {m.landing_page_button_register()}
          </Button>
        {/if}

        <div
          class="ml-1 flex items-center border-l border-border/50 pl-3 sm:ml-2 sm:pl-4 gap-2"
        >
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </div>
  </header>

  <main class="relative flex flex-1 flex-col items-center">
    <div
      class="pointer-events-none absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-20 dark:bg-[radial-gradient(#374151_1px,transparent_1px)]"
    ></div>

    <Hero />

    <section id="features" class="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div class="mb-16 text-center">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          {m.landing_page_cta_everything_needed()}
        </h2>
        <p class="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          {m.landing_page_cta_flex()}
        </p>
      </div>

      <div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {#each features as feature}
          <div
            class="relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 p-8 shadow-sm backdrop-blur-sm transition-colors hover:bg-muted/50"
          >
            <div
              class="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
            >
              <feature.icon class="h-6 w-6" />
            </div>
            <h3 class="mb-3 text-xl font-semibold">{feature.title}</h3>
            <p class="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
        {/each}
      </div>
    </section>

    <section class="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div
        class="relative overflow-hidden rounded-3xl bg-secondary px-6 py-20 text-center shadow-2xl sm:px-16 sm:py-24"
      >
        <div
          class="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/5 to-transparent"
        ></div>

        <h2
          class="relative z-10 mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {m.landing_page_cta_challenge()}
        </h2>
        <p
          class="relative z-10 mx-auto mt-4 max-w-xl text-lg text-muted-foreground"
        >
          {m.landing_page_cta_players()}
        </p>
        <div class="relative z-10 mt-8 flex justify-center">
          {#if !authState.isAuthenticated}
            <Button
              onclick={() => openAuthDialog("register")}
              size="lg"
              class="h-14 px-8 text-base"
            >
              {m.landing_page_auth_dialog_title_register()}
            </Button>
          {:else}
            <Button href="/" size="lg" class="h-14 px-8 text-base">
              {m.hero_page_button()}
            </Button>
          {/if}
        </div>
      </div>
    </section>
  </main>
</div>
