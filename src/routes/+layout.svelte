<svelte:head>
    <title>Unscrabbled</title>
    <meta name="twitter:card" content="summary">
    <meta name="twitter:image" content="./social.jpg">
    <meta name="og:image" content="./social.jpg">
    <meta name="twitter:title" content="Unscrabbled">
    <meta name="twitter:description" content="Word search solver">
    <meta name="Description" content="Word search solver">
</svelte:head>

<script>
  import "../app.postcss";

  import { dev } from "$app/environment";
  import { inject } from "@vercel/analytics";

  inject({ mode: dev ? "development" : "production" });
</script>

<slot />
