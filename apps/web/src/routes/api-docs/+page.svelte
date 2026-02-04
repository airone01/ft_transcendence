<script>
import { onMount } from "svelte";

onMount(() => {
  const script = document.createElement("script");
  script.src = "/swagger-ui/swagger-ui-bundle.js";
  script.onload = () => {
    // @ts-expect-error
    const ui = SwaggerUIBundle({
      dom_id: "#swagger",
      url: "/openapi.yaml",
      // @ts-expect-error
      presets: [SwaggerUIBundle.presets.apis],
    });
  };
  document.body.appendChild(script);
});
</script>

<svelte:head>
  <link rel="stylesheet" href="/swagger-ui/swagger-ui.css" />
</svelte:head>

<div id="swagger"></div>
