<script setup lang="ts">
import { computed } from 'vue'

import { authConfig } from '../config'

const props = withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    size: 'md',
  },
)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'h-9 w-auto object-contain'
    case 'lg':
      return 'h-48 w-auto object-contain drop-shadow-xl'
    case 'md':
    default:
      return 'h-20 w-auto object-contain'
  }
})
</script>

<template>
  <picture>
    <source
      srcset="/logo.webp"
      type="image/webp"
    />
    <img
      src="/logo.png"
      :alt="authConfig.logoAlt"
      :class="sizeClasses"
    />
  </picture>
</template>
