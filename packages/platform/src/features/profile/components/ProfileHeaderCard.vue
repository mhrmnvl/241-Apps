<script setup lang="ts">
import type { Component } from 'vue'
import { Button } from '@/ui/button'

defineProps<{
  fullName: string
  subtitle: string
  initials: string
  isEditable: boolean
  activeTab: string
  actionConfig: { text: string; icon: Component }
}>()

const emit = defineEmits<{
  actionClick: [tabId: string]
}>()
</script>

<template>
  <div class="px-6 pt-6 pb-2">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border bg-background shadow-sm"
    >
      <div class="flex items-center gap-4">
        <div
          class="size-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 shrink-0"
        >
          <span class="text-xl font-bold text-primary">{{ initials }}</span>
        </div>

        <div>
          <h2 class="text-xl font-bold text-foreground">
            {{ fullName || '-' }}
          </h2>
          <p class="text-sm font-medium text-muted-foreground mt-0.5">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <Button
        v-if="isEditable"
        variant="outline"
        class="sm:shrink-0 w-full sm:w-auto"
        @click="emit('actionClick', activeTab)"
      >
        <component
          :is="actionConfig.icon"
          class="size-4 mr-2"
        />
        {{ actionConfig.text }}
      </Button>
    </div>
  </div>
</template>
