<script lang="ts">
import Chat from "$lib/components/chat.svelte";
</script>

<svelte:head>
  <title>Global Chat | Transcendence</title>
</svelte:head>

<main
  class="container max-w-5xl mx-auto py-6 flex flex-col h-[calc(100vh-3rem)]"
>
  <div class="mb-6 shrink-0">
    <h1 class="text-3xl font-bold tracking-tight">Global Chat</h1>
  </div>

  <div
    class="flex-1 flex flex-col border rounded-xl overflow-hidden shadow-sm bg-card"
  >
    <Chat mode="global" />
  </div>
</main>
