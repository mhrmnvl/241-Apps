<script setup lang="ts">
import { BookOpen } from 'lucide-vue-next'

defineProps<{
  message: string
}>()
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-card py-20 text-muted-foreground"
  >
    <BookOpen class="size-10 opacity-30" />
    <p class="text-sm">{{ message }}</p>
  </div>
</template>
