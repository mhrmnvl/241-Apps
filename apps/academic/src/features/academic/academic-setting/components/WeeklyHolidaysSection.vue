<script setup lang="ts">
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { WEEKDAYS } from '../constants/weekdays'

defineProps<{
  draft: number[]
  isSaving: boolean
  canEdit?: boolean
}>()

const emit = defineEmits<{ toggle: [weekday: number] }>()

/**
 * The same seven days, read starting at Monday because that is how a school
 * week is read — derived from `WEEKDAYS` rather than copied, so renaming a day
 * or correcting the numbering cannot leave two lists disagreeing.
 */
const DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DISPLAY_WEEKDAYS = DISPLAY_ORDER.map(
  (value) => WEEKDAYS.find((day) => day.value === value)!,
)
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <!-- Header -->
    <div class="space-y-1">
      <h3 class="text-base font-semibold text-foreground">
        Hari Libur Mingguan
      </h3>
    </div>

    <!-- Day Buttons -->
    <div class="space-y-2.5">
      <label
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
      >
        Pilih Hari Libur
      </label>
      <div class="flex flex-wrap gap-2.5">
        <Button
          v-for="day in DISPLAY_WEEKDAYS"
          :key="day.value"
          type="button"
          size="sm"
          class="h-10 px-4 text-sm font-medium transition-all"
          :variant="draft.includes(day.value) ? 'default' : 'outline'"
          :disabled="isSaving || !canEdit"
          :aria-pressed="draft.includes(day.value)"
          :aria-label="`${day.label} libur`"
          @click="emit('toggle', day.value)"
        >
          {{ day.label }}
        </Button>
      </div>
    </div>

    <!-- Status Summary -->
    <div
      class="rounded-xl bg-muted/40 border border-border/60 p-4 space-y-2 text-sm"
    >
      <span
        class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
      >
        Hari Libur yang Diterapkan
      </span>
      <div
        v-if="draft.length > 0"
        class="flex flex-wrap gap-1.5 pt-0.5"
      >
        <Badge
          v-for="day in WEEKDAYS.filter((d) => draft.includes(d.value))"
          :key="day.value"
          variant="secondary"
          class="font-medium"
        >
          {{ day.label }}
        </Badge>
      </div>
      <p
        v-else
        class="font-medium text-foreground text-sm"
      >
        Tidak ada (Sekolah beroperasi setiap hari)
      </p>
    </div>
  </div>
</template>
