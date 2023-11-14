<svelte:head>
    <title>Unscrabbled | llama</title>
</svelte:head>

<script>
  import "../app.postcss";

  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";

  inject({ mode: dev ? "development" : "production" });
</script>

<slot />
