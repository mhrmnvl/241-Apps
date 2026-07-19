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
import { ChevronDown } from 'lucide-vue-next'
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

// ========================
// MULTI-VIEW STATE
// ========================

const currentView = ref<ViewType>('day')

// Year page anchor for year grid
const yearPageStart = ref(
  Math.floor((placeholder.value?.year ?? new Date().getFullYear()) / 12) * 12,
)

const yearRange = computed(() => {
  return (
    props.yearRange ??
    createYearRange({
      start:
        props?.minValue ??
        (
          toRaw(props.placeholder) ??
          props.defaultPlaceholder ??
          today(getLocalTimeZone())
        ).cycle('year', -100),
      end:
        props?.maxValue ??
        (
          toRaw(props.placeholder) ??
          props.defaultPlaceholder ??
          today(getLocalTimeZone())
        ).cycle('year', 10),
    })
  )
})

const monthsInYear = computed(() =>
  createYear({ dateObj: placeholder.value }).map((m) => ({
    month: m.month,
    label: formatter.custom(toDate(m), { month: 'long' }),
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
        class="flex items-center gap-1 absolute top-0 inset-x-0 justify-between"
      >
        <template v-if="currentView === 'day'">
          <CalendarPrevButton>
            <slot name="calendar-prev-icon" />
          </CalendarPrevButton>
          <CalendarNextButton>
            <slot name="calendar-next-icon" />
          </CalendarNextButton>
        </template>
        <template v-else>
          <button
            :class="
              cn(
                buttonVariants({ variant: 'outline' }),
                'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
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
            :class="
              cn(
                buttonVariants({ variant: 'outline' }),
                'size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
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
              'flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )
          "
          @click="onHeadingClick"
        >
          {{ headingLabel }}
          <ChevronDown class="h-3.5 w-3.5 opacity-60" />
        </button>
      </template>
      <template v-else-if="layout === 'month-and-year'">
        <button
          :class="
            cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium',
              'hover:bg-accent hover:text-accent-foreground transition-colors',
              'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            )
          "
          @click="onHeadingClick"
        >
          {{
            formatter.custom(toDate(date), { month: 'long', year: 'numeric' })
          }}
          <ChevronDown class="h-3.5 w-3.5 opacity-60" />
        </button>
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

    <!-- MONTH VIEW -->
    <div
      v-if="currentView === 'month'"
      class="grid grid-cols-3 gap-2 mt-4"
    >
      <button
        v-for="m in monthsInYear"
        :key="m.month"
        :class="
          cn(
            buttonVariants({
              variant: date.month === m.month ? 'default' : 'ghost',
            }),
            'h-9 text-sm w-full',
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
      class="grid grid-cols-3 gap-2 mt-4"
    >
      <button
        v-for="yr in yearsInView"
        :key="yr"
        :class="
          cn(
            buttonVariants({ variant: date.year === yr ? 'default' : 'ghost' }),
            'h-9 text-sm w-full',
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
              v-for="day in weekDays"
              :key="day"
            >
              {{ day }}
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
