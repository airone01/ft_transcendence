<script lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { onlineUsersStore } from "$lib/stores/presence.store";

let {
  userId,
  username = "Unknown",
  avatarUrl,
  class: className = "h-10 w-10",
} = $props<{
  userId: string | number;
  username?: string;
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
</script>

<div class="relative inline-flex shrink-0 align-middle">
  <Avatar class="border {className}">
    <AvatarImage src={avatarUrl} alt={username} />
    <AvatarFallback>{initials}</AvatarFallback>
  </Avatar>
  <span
    class="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-background {statusColorClass}"
    title={status}
  ></span>
</div>
