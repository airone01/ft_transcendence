<script lang="ts">
import { ChessPawnIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { authState } from "$lib/auth";
import Hero from "$lib/components/hero.svelte";
import * as m from "$lib/paraglide/messages.js";
import { openAuthDialog } from "$lib/stores/auth-dialog.svelte.js";
import LanguageSwitcher from "../language-switcher.svelte";
</script>

<div class="min-h-screen h-full flex flex-col">
  <header
    class="border-b sticky top-0 border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
  >
    <div class="flex h-16 items-center justify-between px-4 w-full">
      <div class="flex items-center gap-2 select-none">
        <ChessPawnIcon class="w-7 h-7" />
        <span class="text-xl font-semibold tracking-tight">
          {m.project_name()}
        </span>
      </div>
      <nav class="hidden items-center gap-6 md:flex"><!-- . --></nav>
      <div class="flex items-center gap-3">
        {#if authState.isAuthenticated}
          <!-- TODO: wtf? -->
          <form action="/logout" method="POST">
            <Button type="submit" variant="ghost" size="sm">
              {m.landing_page_button_logout()}
            </Button>
          </form>
          <Button href="/home" size="sm">Dashboard </Button>
        {:else}
          <Button
            onclick={() => openAuthDialog("login")}
            variant="ghost"
            size="sm"
          >
            {m.landing_page_button_login()}
          </Button>
          <Button onclick={() => openAuthDialog("register")} size="sm">
            {m.landing_page_button_register()}
          </Button>
        {/if}
    <LanguageSwitcher />
      </div>
    </div>
  </header>
  <main class="h-full w-full flex justify-center items-center">
    <Hero />
  </main>
</div>
