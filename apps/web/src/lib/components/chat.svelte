<script lang="ts">
import { SendIcon } from "@lucide/svelte";
import { Button } from "@transc/ui/button";
import { Input } from "@transc/ui/input";
import { tick, untrack } from "svelte";
import * as m from "$lib/paraglide/messages";
import { getLocale } from "$lib/paraglide/runtime";
import {
  type ChatMessage,
  friendMessages,
  globalMessages,
  sendFriendMessage,
  sendGlobalMessage,
} from "$lib/stores/chat.store";

const {
  mode = "global",
  friendId,
  initialMessages = [],
}: {
  mode?: "global" | "friend";
  friendId?: string;
  initialMessages?: ChatMessage[];
} = $props();

let content = $state("");
let messagesContainer: HTMLElement | null = $state(null);

$effect(() => {
  untrack(() => {
    if (
      mode === "global" &&
      $globalMessages.length === 0 &&
      initialMessages.length > 0
    ) {
      globalMessages.set(initialMessages);
    } else if (mode === "friend" && friendId) {
      if (
        !$friendMessages[friendId] ||
        $friendMessages[friendId].length === 0
      ) {
        if (initialMessages.length > 0) {
          friendMessages.update((m) => ({ ...m, [friendId]: initialMessages }));
        }
      }
    }
  });
});

let messages = $derived.by(() => {
  if (mode === "global") return $globalMessages;
  if (mode === "friend" && friendId) {
    return $friendMessages[friendId] || [];
  }
  return [];
});

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

  if (mode === "global") {
    sendGlobalMessage(content);
  } else if (mode === "friend" && friendId) {
    sendFriendMessage(friendId, content);
  }
  content = "";
}
</script>

<div class="flex flex-col h-full bg-background overflow-hidden">
  <div
    bind:this={messagesContainer}
    class="flex-1 overflow-y-auto p-4 space-y-4 min-h-50"
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
          <span class="font-bold text-sm text-primary"> {msg.username} </span>
          <span class="text-xs text-muted-foreground capitalize">
            {new Date(msg.timestamp).toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' })}
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
