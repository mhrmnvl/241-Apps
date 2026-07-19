<script setup lang="ts">
/**
 * Komponen: Date Picker
 * Deskripsi: Komponen input tanggal berbasis popover dan kalender shadcn
 *
 * Digunakan pada:
 * - Formulir-formulir pengisian yang membutuhkan input tanggal
 */
import { computed } from 'vue'
import type { CalendarDate } from '@internationalized/date'
import { parseDate, getLocalTimeZone, today } from '@internationalized/date'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { Calendar } from '@/ui/calendar'
import { Button } from '@/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { cn } from '@/shared/utils/utils'

const props = withDefaults(
  defineProps<{
    modelValue: string // YYYY-MM-DD string
    placeholder?: string
    hasError?: boolean
    allowFutureDates?: boolean
    disabled?: boolean
    minDate?: string
    maxDate?: string
  }>(),
  {
    allowFutureDates: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const calendarValue = computed(() => {
  if (!props.modelValue) return undefined
  try {
    return parseDate(props.modelValue)
  } catch {
    return undefined
  }
})

const displayLabel = computed(() => {
  if (!props.modelValue) return props.placeholder ?? 'Pilih tanggal'
  const [year, month, day] = props.modelValue.split('-')
  return `${day}/${month}/${year}`
})

const minCalendarValue = computed(() => {
  if (props.minDate) {
    try {
      return parseDate(props.minDate)
    } catch {
      return undefined
    }
  }
  return undefined
})

const maxCalendarValue = computed(() => {
  if (props.maxDate) {
    try {
      return parseDate(props.maxDate)
    } catch {
      return undefined
    }
  }
  return props.allowFutureDates
    ? today(getLocalTimeZone()).add({ years: 10 })
    : today(getLocalTimeZone())
})

/**
 * Fungsi: Menangani seleksi tanggal pada kalender
 * Parameter:
 * - date (CalendarDate | undefined): Nilai tanggal yang dipilih dari kalender
 *
 * Mengembalikan:
 * - Emit pembaruan string pada modelValue
 */
function onSelect(date: CalendarDate | undefined) {
  if (!date) return
  emit('update:modelValue', date.toString())
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :disabled="disabled"
        :class="
          cn(
            'w-full justify-start text-left font-normal h-9',
            !modelValue && 'text-muted-foreground',
            hasError && 'border-destructive',
          )
        "
      >
        <CalendarIcon class="mr-2 size-4 opacity-60 shrink-0" />
        {{ displayLabel }}
      </Button>
    </PopoverTrigger>
    <PopoverContent
      class="w-auto p-0"
      align="start"
    >
      <Calendar
        layout="month-and-year"
        :model-value="calendarValue"
        :min-value="minCalendarValue"
        :max-value="maxCalendarValue"
        @update:model-value="onSelect($event as CalendarDate)"
      />
    </PopoverContent>
  </Popover>
</template>
