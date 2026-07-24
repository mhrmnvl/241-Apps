<script lang="ts" setup>
import type { CalendarRootEmits, CalendarRootProps, DateValue } from 'reka-ui'
import type { HTMLAttributes, Ref } from 'vue'
import { getLocalTimeZone, today } from '@internationalized/date'
import { reactiveOmit, useVModel } from '@vueuse/core'
import { CalendarRoot, useDateFormatter, useForwardPropsEmits } from 'reka-ui'
import { createYear, createYearRange, toDate } from 'reka-ui/date'
import { computed, ref, toRaw } from 'vue'
import { cn } from '@/ui/utils'
import { buttonVariants } from '@/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNextButton,
  CalendarPrevButton,
} from '.'
import type { LayoutTypes } from '.'

type ViewType = 'day' | 'month' | 'year'

const props = withDefaults(
  defineProps<
    CalendarRootProps & {
      class?: HTMLAttributes['class']
      layout?: LayoutTypes
      yearRange?: DateValue[]
    }
  >(),
  {
    modelValue: undefined,
    layout: undefined,
  },
)

const emits = defineEmits<CalendarRootEmits>()

const delegatedProps = reactiveOmit(props, 'class', 'layout', 'placeholder')

const placeholder = useVModel(props, 'placeholder', emits, {
  passive: true,
  defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<DateValue>

const formatter = useDateFormatter(props.locale ?? 'en')

const currentView = ref<ViewType>('day')

// Year page anchor for year grid
const yearPageStart = ref(
  Math.floor((placeholder.value?.year ?? new Date().getFullYear()) / 12) * 12,
)

const yearRange = computed(() => {
  return createYearRange({
    start: (
      toRaw(placeholder.value) ??
      props.defaultPlaceholder ??
      today(getLocalTimeZone())
    ).cycle('year', -100),
    end: (
      toRaw(placeholder.value) ??
      props.defaultPlaceholder ??
      today(getLocalTimeZone())
    ).cycle('year', 100),
  })
})

const canGoPrev = computed(() => {
  if (currentView.value === 'month') {
    if (!props.minValue) return true
    return placeholder.value.year - 1 >= props.minValue.year
  }
  if (currentView.value === 'year') {
    if (!props.minValue) return true
    return yearPageStart.value - 1 >= props.minValue.year
  }
  return true
})

const canGoNext = computed(() => {
  if (currentView.value === 'month') {
    if (!props.maxValue) return true
    return placeholder.value.year + 1 <= props.maxValue.year
  }
  if (currentView.value === 'year') {
    if (!props.maxValue) return true
    return yearPageStart.value + 12 <= props.maxValue.year
  }
  return true
})

const monthsInYear = computed(() =>
  createYear({ dateObj: placeholder.value }).map((m) => ({
    month: m.month,
    label: formatter.custom(toDate(m), { month: 'short' }),
  })),
)

const yearsInView = computed(() => {
  const allYears = yearRange.value.map((y) => y.year)
  const start = yearPageStart.value
  const end = start + 11
  return allYears.filter((y) => y >= start && y <= end)
})

const headingLabel = computed(() => {
  if (currentView.value === 'month') {
    return formatter.custom(toDate(placeholder.value), { year: 'numeric' })
  }
  if (currentView.value === 'year') {
    const yrs = yearsInView.value
    return yrs.length ? `${yrs[0]} – ${yrs[yrs.length - 1]}` : ''
  }
  return ''
})

function onHeadingClick() {
  if (!props.layout) return
  if (currentView.value === 'day') currentView.value = 'month'
  else if (currentView.value === 'month') currentView.value = 'year'
  else currentView.value = 'day'
}

function selectMonth(month: number) {
  placeholder.value = placeholder.value.set({ month })
  currentView.value = 'day'
}

function selectYear(year: number) {
  placeholder.value = placeholder.value.set({ year })
  currentView.value = 'month'
}

function isMonthDisabled(month: number) {
  const currentYear = placeholder.value.year
  if (props.minValue) {
    if (currentYear < props.minValue.year) return true
    if (currentYear === props.minValue.year && month < props.minValue.month)
      return true
  }
  if (props.maxValue) {
    if (currentYear > props.maxValue.year) return true
    if (currentYear === props.maxValue.year && month > props.maxValue.month)
      return true
  }
  return false
}

function isYearDisabled(year: number) {
  if (props.minValue && year < props.minValue.year) return true
  if (props.maxValue && year > props.maxValue.year) return true
  return false
}

function handlePrevPage() {
  if (currentView.value === 'month') {
    placeholder.value = placeholder.value.set({
      year: placeholder.value.year - 1,
    })
  } else if (currentView.value === 'year') {
    yearPageStart.value -= 12
  }
}

function handleNextPage() {
  if (currentView.value === 'month') {
    placeholder.value = placeholder.value.set({
      year: placeholder.value.year + 1,
    })
  } else if (currentView.value === 'year') {
    yearPageStart.value += 12
  }
}

const WEEKDAY_MAP = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

// Month/Year select handlers (for layout prop on day view)
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CalendarRoot
    v-slot="{ grid, weekDays, date }"
    v-bind="forwarded"
    v-model:placeholder="placeholder"
    data-slot="calendar"
    :class="cn('p-3', props.class)"
  >
    <CalendarHeader class="pt-0">
      <!-- Nav buttons: normal in day view, custom in month/year view -->
      <nav
        class="flex items-center gap-1 absolute top-0 inset-x-0 justify-between pointer-events-none"
      >
        <template v-if="currentView === 'day'">
          <CalendarPrevButton class="pointer-events-auto shadow-none">
            <slot name="calendar-prev-icon" />
          </CalendarPrevButton>
          <CalendarNextButton class="pointer-events-auto shadow-none">
            <slot name="calendar-next-icon" />
          </CalendarNextButton>
        </template>
        <template v-else>
          <button
            :disabled="!canGoPrev"
            :class="
              cn(
                buttonVariants({ variant: 'outline' }),
                'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto shadow-none',
                !canGoPrev &&
                  'opacity-20 pointer-events-none cursor-not-allowed',
              )
            "
            @click="handlePrevPage"
          >
            <slot name="calendar-prev-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </slot>
          </button>
          <button
            :disabled="!canGoNext"
            :class="
              cn(
                buttonVariants({ variant: 'outline' }),
                'size-7 bg-transparent p-0 opacity-50 hover:opacity-100 pointer-events-auto shadow-none',
                !canGoNext &&
                  'opacity-20 pointer-events-none cursor-not-allowed',
              )
            "
            @click="handleNextPage"
          >
            <slot name="calendar-next-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </slot>
          </button>
        </template>
      </nav>

      <!-- Heading -->
      <template v-if="layout && currentView !== 'day'">
        <button
          :class="
            cn(
              buttonVariants({ variant: 'outline' }),
              'h-7 px-3 text-xs font-medium bg-transparent pointer-events-auto shadow-none',
              currentView === 'year' &&
                'cursor-default hover:bg-transparent hover:text-foreground active:scale-100',
            )
          "
          @click="currentView === 'month' ? onHeadingClick() : null"
        >
          {{ headingLabel }}
        </button>
      </template>
      <template v-else-if="layout === 'month-and-year'">
        <div class="flex items-center gap-1">
          <button
            :class="
              cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 px-2.5 text-xs font-medium bg-transparent pointer-events-auto shadow-none capitalize',
              )
            "
            @click="currentView = 'month'"
          >
            {{ formatter.custom(toDate(date), { month: 'long' }) }}
          </button>
          <button
            :class="
              cn(
                buttonVariants({ variant: 'outline' }),
                'h-7 px-2.5 text-xs font-medium bg-transparent pointer-events-auto shadow-none',
              )
            "
            @click="currentView = 'year'"
          >
            {{ formatter.custom(toDate(date), { year: 'numeric' }) }}
          </button>
        </div>
      </template>
      <template v-else-if="layout === 'month-only'">
        <div class="flex items-center justify-center gap-1">
          <Select
            :model-value="String(date.month)"
            @update:model-value="
              (v) => {
                placeholder = placeholder.set({ month: Number(v) })
              }
            "
          >
            <SelectTrigger
              class="h-8 w-auto gap-1 text-sm font-medium px-2 focus:ring-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="m in monthsInYear"
                :key="m.month"
                :value="String(m.month)"
              >
                {{ m.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          {{ formatter.custom(toDate(date), { year: 'numeric' }) }}
        </div>
      </template>
      <template v-else-if="layout === 'year-only'">
        {{ formatter.custom(toDate(date), { month: 'short' }) }}
        <Select
          :model-value="String(date.year)"
          @update:model-value="
            (v) => {
              placeholder = placeholder.set({ year: Number(v) })
            }
          "
        >
          <SelectTrigger
            class="h-8 w-auto gap-1 text-sm font-medium px-2 focus:ring-0"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="yr in yearRange"
              :key="yr.year"
              :value="String(yr.year)"
            >
              {{ formatter.custom(toDate(yr), { year: 'numeric' }) }}
            </SelectItem>
          </SelectContent>
        </Select>
      </template>
      <template v-else>
        <CalendarHeading />
      </template>
    </CalendarHeader>
    <div class="border-b border-border/80 my-2" />

    <!-- MONTH VIEW -->
    <div
      v-if="currentView === 'month'"
      class="grid grid-cols-3 gap-2 mt-3"
    >
      <button
        v-for="m in monthsInYear"
        :key="m.month"
        :disabled="isMonthDisabled(m.month)"
        :class="
          cn(
            buttonVariants({
              variant: date.month === m.month ? 'default' : 'ghost',
            }),
            'h-9 text-sm w-full shadow-none',
            isMonthDisabled(m.month) &&
              'opacity-30 pointer-events-none cursor-not-allowed',
          )
        "
        @click="selectMonth(m.month)"
      >
        {{ m.label }}
      </button>
    </div>

    <!-- YEAR VIEW -->
    <div
      v-else-if="currentView === 'year'"
      class="grid grid-cols-3 gap-2 mt-3"
    >
      <button
        v-for="yr in yearsInView"
        :key="yr"
        :disabled="isYearDisabled(yr)"
        :class="
          cn(
            buttonVariants({ variant: date.year === yr ? 'default' : 'ghost' }),
            'h-9 text-sm w-full shadow-none',
            isYearDisabled(yr) &&
              'opacity-30 pointer-events-none cursor-not-allowed',
          )
        "
        @click="selectYear(yr)"
      >
        {{ yr }}
      </button>
    </div>

    <!-- DAY VIEW -->
    <div
      v-else
      class="flex flex-col gap-y-4 mt-4 sm:flex-row sm:gap-x-4 sm:gap-y-0"
    >
      <CalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
      >
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell
              v-for="(_, index) in weekDays"
              :key="index"
              class="font-semibold text-foreground"
            >
              {{ WEEKDAY_MAP[index] }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`weekDate-${index}`"
            class="mt-2 w-full"
          >
            <CalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
            >
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
