<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import type { ButtonVariants } from "."
import { Primitive } from "reka-ui"
import { cn } from '~/lib/utils'
import { buttonVariants } from "."

interface Props {
  variant?: ButtonVariants["variant"]
  size?: ButtonVariants["size"]
  class?: HTMLAttributes["class"]
  as?: any
  asChild?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: "button",
  asChild: false,
})
</script>

<template>
  <Primitive
    :as="props.as"
    :as-child="props.asChild"
    :class="cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)"
  >
    <slot />
  </Primitive>
</template>
