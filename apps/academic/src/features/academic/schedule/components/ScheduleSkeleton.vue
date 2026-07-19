<script setup lang="ts">
import { Skeleton } from '@/ui/skeleton'
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl bg-card p-6 shadow-sm border space-y-6"
  >
    <div class="flex flex-col md:flex-row justify-between gap-4">
      <Skeleton class="h-8 w-48" />
      <Skeleton class="h-8 w-64" />
    </div>
    <div class="rounded-xl border p-4 space-y-4 bg-muted/10">
      <div class="flex gap-4 border-b pb-4">
        <Skeleton
          v-for="i in 6"
          :key="i"
          class="h-6 flex-1"
        />
      </div>
      <Skeleton
        v-for="i in 8"
        :key="i"
        class="h-10 w-full"
      />
    </div>
  </div>
</template>
