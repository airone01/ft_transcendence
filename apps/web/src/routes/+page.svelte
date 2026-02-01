<script lang="ts">
import { authState } from "$lib/auth.svelte";
</script>

{#if authState.isAuthenticated}
  <h1>Welcome back, {authState.user?.email}!</h1>
  <p>Your session expires on: {authState.session?.expiresAt.toLocaleDateString()}</p>
  <form action="/logout" method="POST">
    <button class="underline cursor-pointer">Logout</button>
  </form>
{:else}
  You are logged out.
  <a href="/login" class="underline">Login</a>
  <a href="/register" class="underline">Register</a>
{/if}
