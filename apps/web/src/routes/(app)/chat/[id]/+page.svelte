<script lang="ts">
import { page } from "$app/state";
import Chat from "$lib/components/chat.svelte";
import { m } from "$lib/paraglide/messages";

let friendId: string = page.params.id ?? "0";
</script>

<main
  class="container max-w-5xl mx-auto py-6 flex flex-col h-[calc(100vh-3rem)]"
>
  <div class="mb-6 shrink-0">
    <h1 class="text-3xl font-bold tracking-tight">{m.chat_title_friend()}</h1>
  </div>

  <div
    class="flex-1 flex flex-col border rounded-xl overflow-hidden shadow-sm bg-card"
  >
    <Chat mode="friend" {friendId} />
  </div>
</main>
