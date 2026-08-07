<script setup lang="ts">
import { computed, ref, type HTMLAttributes } from 'vue'
import {
  parseDate,
  getLocalTimeZone,
  today,
  CalendarDate,
} from '@internationalized/date'
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
    class?: HTMLAttributes['class']
  }>(),
  {
    allowFutureDates: false,
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

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
  const currentYear = today(getLocalTimeZone()).year
  const minYear = Math.floor((currentYear - 24) / 12) * 12
  return new CalendarDate(minYear, 1, 1)
})

const maxCalendarValue = computed(() => {
  if (props.maxDate) {
    try {
      return parseDate(props.maxDate)
    } catch {
      return undefined
    }
  }
  if (props.allowFutureDates) {
    const currentYear = today(getLocalTimeZone()).year
    const maxYear = Math.floor((currentYear + 24) / 12) * 12 + 11
    return new CalendarDate(maxYear, 12, 31)
  }
  return today(getLocalTimeZone())
})

function onSelect(date: CalendarDate | undefined) {
  if (!date) return
  emit('update:modelValue', date.toString())
  isOpen.value = false
}
</script>

<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :disabled="disabled"
        :class="
          cn(
            'w-full justify-start text-left font-normal h-9',
            !modelValue && 'text-muted-foreground',
            hasError && 'border-destructive',
            props.class,
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
