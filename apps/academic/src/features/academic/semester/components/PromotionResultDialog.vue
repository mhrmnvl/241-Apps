<script setup lang="ts">
import type { PromotionResult } from '../types'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogScrollContent,
  DialogTitle,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { CheckCircle2 } from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  open: boolean
  result: PromotionResult | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  done: []
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const stats = computed(() => {
  if (!props.result) return []
  return [
    {
      label: 'Naik Kelas',
      value: props.result.promoted,
      color: 'text-green-600',
    },
    {
      label: 'Tinggal Kelas',
      value: props.result.repeated,
      color: 'text-amber-600',
    },
    { label: 'Lulus', value: props.result.graduated, color: 'text-blue-600' },
    {
      label: 'Dilewati',
      value: props.result.skipped,
      color: 'text-muted-foreground',
    },
  ]
})

function handleDone() {
  emit('done')
  open.value = false
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogScrollContent class="sm:max-w-md">
      <DialogHeader>
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-full bg-green-100"
          >
            <CheckCircle2 class="h-5 w-5 text-green-600" />
          </div>
          <div>
            <DialogTitle>Kenaikan Kelas Berhasil</DialogTitle>
            <DialogDescription
              >Proses kenaikan kelas telah selesai.</DialogDescription
            >
          </div>
        </div>
      </DialogHeader>

      <div class="grid grid-cols-2 gap-4 py-6">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="rounded-lg border p-4 text-center"
        >
          <p
            class="text-2xl font-bold"
            :class="stat.color"
          >
            {{ stat.value }}
          </p>
          <p class="text-sm text-muted-foreground mt-1">{{ stat.label }}</p>
        </div>
      </div>

      <DialogFooter>
        <Button @click="handleDone"> Selesai </Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>
