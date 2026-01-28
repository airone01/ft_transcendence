<script lang="ts">
// This 'data' prop comes from the +page.server.ts file you just created
const { data } = $props();
</script>

<div style="padding: 2rem; border: 2px solid #ccc; border-radius: 8px; margin-top: 2rem;">
  <h1>Database Status</h1>
  
  <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">
    Status: <strong>{data.dbStatus}</strong>
  </h2>

  {#if data.userCount !== undefined}
    <p>Users found: {data.userCount}</p>
  {/if}

  {#if data.error}
    <div style="color: red; background: #ffe6e6; padding: 1rem; border-radius: 4px;">
      <p><strong>Error Details:</strong> {data.error}</p>
    </div>
  {/if}
</div>

<hr style="margin: 2rem 0;" />
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
