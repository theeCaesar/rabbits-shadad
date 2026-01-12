<template>
  <div style="font-family: 'Bubblegum Sans', 'Chewy', 'Comic Neue', cursive, sans-serif;">
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
// Global app setup
useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Chewy&family=Comic+Neue:wght@300;400;700&display=swap'
    }
  ]
})
</script>

<style>
html, body, * {
  font-family: 'Bubblegum Sans', 'Chewy', 'Comic Neue', cursive, sans-serif !important;
}
</style>
