<script lang="ts">
import { SendIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { Input } from "@transc/ui/input";
import { tick } from "svelte";
import { toast } from "svelte-sonner";
import * as m from "$lib/paraglide/messages.js";
import {
  gameMessages,
  globalMessages,
  sendGameMessage,
  sendGlobalMessage,
} from "$lib/stores/chat.store";

const {
  mode = "global",
  gameId,
}: {
  mode?: "global" | "game";
  gameId?: string;
} = $props();

let content = $state("");
let messagesContainer: HTMLElement | null = $state(null);

let messages = $derived(mode === "global" ? $globalMessages : $gameMessages);

$effect(() => {
  if (messages.length && messagesContainer) {
    tick().then(() => {
      messagesContainer?.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
    });
  }
});

function handleSend(e: Event) {
  e.preventDefault();
  if (!content.trim()) return;

  if (content.length > 250) {
    toast.error(m.chat_err_too_large());
    return;
  }

  if (mode === "global") {
    sendGlobalMessage(content);
  } else if (mode === "game" && gameId) {
    sendGameMessage(gameId, content);
  }

  content = "";
}
</script>

<div class="flex flex-col h-full bg-background overflow-hidden">
  <div
    bind:this={messagesContainer}
    class="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]"
  >
    {#if messages.length === 0}
      <div
        class="h-full flex items-center justify-center text-muted-foreground text-sm"
      >
        {m.chat_no_msgs()}
      </div>
    {/if}
    {#each messages as msg}
      <div class="flex flex-col">
        <div class="flex items-baseline gap-2">
          <span class="font-bold text-sm text-primary">{msg.username}</span>
          <span class="text-xs text-muted-foreground">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <p class="text-sm mt-0.5 wrap-break-word">{msg.content}</p>
      </div>
    {/each}
  </div>

  <form
    onsubmit={handleSend}
    class="p-3 border-t flex gap-2 items-center shrink-0"
  >
    <Input
      bind:value={content}
      placeholder={m.chat_prompt_type_msg()}
      class="flex-1"
      autocomplete="off"
    />
    <Button
      type="submit"
      size="icon"
      variant="default"
      disabled={!content.trim()}
    >
      <SendIcon class="w-4 h-4" />
      <span class="sr-only">{m.chat_prompt_send()}</span>
    </Button>
  </form>
</div>
