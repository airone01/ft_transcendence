<script lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { m } from "$lib/paraglide/messages";
import { onlineUsersStore } from "$lib/stores/presence.store";

let {
  userId,
  username = "Unknown",
  avatarUrl,
  class: className = "h-10 w-10",
} = $props<{
  userId: string | number;
  username: string | undefined | null;
  avatarUrl?: string | null;
  class?: string;
}>();

let status = $derived($onlineUsersStore.get(String(userId)) ?? "offline");
let initials = $derived(username.substring(0, 2).toUpperCase());

let statusColorClass = $derived(
  status === "online"
    ? "bg-green-500"
    : status === "ingame"
      ? "bg-purple-500"
      : "bg-muted-foreground",
);

let resolveStatus = (status: string) => {
  switch (status) {
    case "online":
      return m.online();
    case "offline":
      return m.offline();
    case "ingame":
      return m.ingame();
  }
};
</script>

<div class="relative inline-flex shrink-0 align-middle">
  <Avatar class="border {className}">
    <AvatarImage src={avatarUrl} alt={username} />
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
  <span
    class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background {statusColorClass}"
    title={resolveStatus(status)}
  ></span>
</div>
