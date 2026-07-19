<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/ui/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <th
    data-slot="table-head"
    :class="
      cn(
        'text-foreground h-8 px-2 text-left align-middle font-medium border-r border-border last:border-r-0 whitespace-nowrap [&:has([role=checkbox])]:pr-0 *:[[role=checkbox]]:translate-y-[2px]',
        props.class,
      )
    "
  >
    <slot />
  </th>
</template>
