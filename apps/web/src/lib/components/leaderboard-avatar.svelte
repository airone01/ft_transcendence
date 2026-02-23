<script lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@transc/ui/avatar";
import { Spinner } from "@transc/ui/spinner";

const { userPromise, fallbackText, class: className } = $props();
</script>

{#await userPromise}
  <Avatar class={className}>
    <AvatarFallback class="bg-muted">
      <Spinner />
    </AvatarFallback>
  </Avatar>
{:then user}
  <Avatar class={className}>
    <AvatarImage src={user?.avatar} alt={user?.username} />
    <AvatarFallback class="font-bold">{fallbackText}</AvatarFallback>
  </Avatar>
{:catch _e}
  <Avatar class={className}>
    <AvatarFallback class="font-bold text-muted-foreground">
      {fallbackText}
    </AvatarFallback>
  </Avatar>
{/await}
