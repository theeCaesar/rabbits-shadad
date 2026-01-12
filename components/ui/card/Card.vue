<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()
</script>

<template>
  <div
    :class="
      cn(
        'rounded-lg bg-white dark:bg-gray-800 text-black dark:text-gray-100 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
