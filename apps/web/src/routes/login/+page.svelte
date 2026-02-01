<script lang="ts">
import { enhance } from "$app/forms";
let { form } = $props();
</script>

<div class="p-4 max-w-sm mx-auto space-y-4">
  <h1 class="text-2xl font-bold">Login</h1>

  {#if form?.message}
    <p class="text-red-500">{form.message}</p>
  {/if}

  <form method="POST" use:enhance class="flex flex-col gap-4">
    <label class="flex flex-col">
      <span>Email</span>
      <input name="email" type="email" required class="border p-2 rounded" />
    </label>
    
    <label class="flex flex-col">
      <span>Password</span>
      <input name="password" type="password" required class="border p-2 rounded" />
    </label>

    <button class="bg-green-600 text-white p-2 rounded hover:bg-green-700">
      Sign In
    </button>
  </form>
</div>
