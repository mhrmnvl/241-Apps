<script setup lang="ts">
import { computed } from 'vue'
import { formatEntityName } from '@/shared/utils/utils'
import { useAuthSession } from '@/features/platform/auth'
import type {
  ScheduleDay,
  ScheduleClassroom,
  ScheduleTimeSlot,
  ScheduleLessonMap,
} from '../types'

const props = defineProps<{
  isPersonal: boolean
  user: { identifier?: string } | null
  selectedClassroom: ScheduleClassroom | undefined
  sortedTimeSlots: ScheduleTimeSlot[]
  days: ScheduleDay[]
  lessonMap: ScheduleLessonMap
}>()

const { hasRole } = useAuthSession()
const isStudent = computed(() => hasRole('STUDENT'))

const colCount = computed(() => props.days.length + 2)
const gridCols = computed(() => `auto auto repeat(${props.days.length}, 1fr)`)

/** Parse a time string (ISO or HH:MM) into total minutes for comparison. */
function parseMinutes(val: string): number {
  if (!val) return 0
  try {
    const d = new Date(val)
    if (!isNaN(d.getTime())) return d.getUTCHours() * 60 + d.getUTCMinutes()
  } catch {
    // fallback
  }
  const parts = val.substring(0, 5).split(':')
  return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0)
}

function timesOverlap(a: ScheduleTimeSlot, b: ScheduleTimeSlot): boolean {
  const aStart = parseMinutes(a.startTime)
  const aEnd = parseMinutes(a.endTime)
  const bStart = parseMinutes(b.startTime)
  const bEnd = parseMinutes(b.endTime)
  return aStart < bEnd && bStart < aEnd
}

/**
 * Map of lessonSlotId → dayValue → overlapping non-lesson slot.
 * When Upacara (07:30-08:30, Monday) overlaps Jam 1 (07:30-08:00) and
 * Jam 2 (08:00-08:30), it shows "Upacara" in the Senin cell of those rows.
 */
const overlayMap = computed(() => {
  const lessonSlots = props.sortedTimeSlots.filter(
    (ts) => ts.isLesson !== false,
  )
  const nonLessonSlots = props.sortedTimeSlots.filter(
    (ts) => ts.isLesson === false,
  )
  const map: Record<string, Record<string, ScheduleTimeSlot>> = {}

  for (const nls of nonLessonSlots) {
    const nlsDays = nls.days ?? []
    for (const ls of lessonSlots) {
      if (!timesOverlap(nls, ls)) continue
      for (const day of props.days) {
        if (nlsDays.length === 0 || nlsDays.includes(day.value)) {
          map[ls.id] ??= {}
          map[ls.id][day.value] = nls
        }
      }
    }
  }
  return map
})

/** IDs of non-lesson slots that overlap with at least one lesson slot (hidden as rows). */
const mergedNonLessonIds = computed(() => {
  const ids = new Set<string>()
  const lessonSlots = props.sortedTimeSlots.filter(
    (ts) => ts.isLesson !== false,
  )
  const nonLessonSlots = props.sortedTimeSlots.filter(
    (ts) => ts.isLesson === false,
  )
  for (const nls of nonLessonSlots) {
    if (lessonSlots.some((ls) => timesOverlap(nls, ls))) {
      ids.add(nls.id)
    }
  }
  return ids
})

/** Time slots to render as rows: lesson slots + non-overlapping non-lesson slots. */
const displaySlots = computed(() =>
  props.sortedTimeSlots.filter((ts) => !mergedNonLessonIds.value.has(ts.id)),
)

function appliesOn(slot: ScheduleTimeSlot, day: string): boolean {
  const d = slot.days ?? []
  return d.length === 0 || d.includes(day)
}

function formatPukul(startVal: string, endVal: string): string {
  return `${toHHMM(startVal)} - ${toHHMM(endVal)}`
}

function toHHMM(val: string): string {
  if (!val) return '-'
  try {
    const d = new Date(val)
    if (!isNaN(d.getTime())) {
      const h = d.getUTCHours().toString().padStart(2, '0')
      const m = d.getUTCMinutes().toString().padStart(2, '0')
      return `${h}:${m}`
    }
  } catch {
    // no-op fallback
  }
  return String(val).substring(0, 5)
}
</script>

<template>
  <div class="border rounded-md bg-background">
    <div
      class="schedule-grid"
      :style="{
        display: 'grid',
        gridTemplateColumns: gridCols,
      }"
    >
      <!-- Header row -->
      <div class="cell header-cell">Pukul</div>
      <div class="cell header-cell">Jam</div>
      <div
        v-for="(day, i) in days"
        :key="'h-' + day.value"
        class="cell header-cell"
        :class="{ 'border-r-0': i === days.length - 1 }"
      >
        {{ day.label }}
      </div>

      <!-- Body rows -->
      <template
        v-for="(ts, idx) in displaySlots"
        :key="ts.id"
      >
        <!-- Non-lesson row (only those that don't overlap any lesson) -->
        <template v-if="ts.isLesson === false">
          <div class="cell break-cell">
            {{ formatPukul(ts.startTime, ts.endTime) }}
          </div>
          <div
            class="cell break-cell font-semibold text-amber-600 dark:text-amber-400"
          >
            {{ formatEntityName(ts.name) }}
          </div>
          <!-- All days: merge into one spanning cell -->
          <div
            v-if="!ts.days?.length"
            class="cell break-cell italic text-muted-foreground border-r-0"
            :style="{ gridColumn: `span ${days.length}` }"
          >
            {{ formatEntityName(ts.name) }}
          </div>
          <!-- Specific days: keep individual cells -->
          <template v-else>
            <div
              v-for="(day, i) in days"
              :key="'b-' + day.value"
              class="cell break-cell italic text-muted-foreground"
              :class="{ 'border-r-0': i === days.length - 1 }"
            >
              <template v-if="appliesOn(ts, day.value)">
                {{ formatEntityName(ts.name) }}
              </template>
            </div>
          </template>
        </template>

        <!-- Lesson row -->
        <template v-else>
          <div
            class="cell lesson-cell"
            :class="idx % 2 === 1 ? 'stripe' : ''"
          >
            {{ formatPukul(ts.startTime, ts.endTime) }}
          </div>
          <div
            class="cell lesson-cell text-sm"
            :class="idx % 2 === 1 ? 'stripe' : ''"
          >
            {{ formatEntityName(ts.name) }}
          </div>
          <div
            v-for="(day, i) in days"
            :key="'l-' + day.value"
            class="cell lesson-cell"
            :class="[
              idx % 2 === 1 ? 'stripe' : '',
              { 'border-r-0': i === days.length - 1 },
              { 'overlay-cell': !!overlayMap[ts.id]?.[day.value] },
            ]"
          >
            <!-- Non-lesson overlay (e.g. Upacara on Senin at Jam 1/2) -->
            <template v-if="overlayMap[ts.id]?.[day.value]">
              <span
                class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 italic"
              >
                {{ formatEntityName(overlayMap[ts.id][day.value].name) }}
              </span>
            </template>

            <!-- Normal lesson -->
            <template v-else-if="lessonMap[ts.id]?.[day.value]">
              <p class="font-medium text-foreground text-xs leading-tight">
                {{ lessonMap[ts.id]?.[day.value]?.subject?.name ?? '–' }}
              </p>
              <!-- Student: show teacher name -->
              <p
                v-if="
                  isStudent &&
                  lessonMap[ts.id]?.[day.value]?.teacher?.user?.profile?.name
                "
                class="text-[10px] text-muted-foreground mt-0.5 truncate"
              >
                {{
                  lessonMap[ts.id]?.[day.value]?.teacher?.user?.profile?.name
                }}
              </p>
              <!-- Teacher/Admin personal: show classroom -->
              <p
                v-else-if="
                  isPersonal &&
                  !isStudent &&
                  lessonMap[ts.id]?.[day.value]?.classroom?.name
                "
                class="text-[10px] text-primary/80 font-medium mt-0.5 truncate"
              >
                {{
                  lessonMap[ts.id]?.[day.value]?.classroom?.code ??
                  lessonMap[ts.id]?.[day.value]?.classroom?.name ??
                  '-'
                }}
              </p>
              <!-- Admin class view: show teacher -->
              <p
                v-else-if="
                  !isPersonal &&
                  lessonMap[ts.id]?.[day.value]?.teacher?.user?.profile?.name
                "
                class="text-[10px] text-muted-foreground mt-0.5 truncate"
              >
                {{
                  lessonMap[ts.id]?.[day.value]?.teacher?.user?.profile?.name
                }}
              </p>
            </template>

            <!-- Empty -->
            <span
              v-else
              class="text-muted-foreground/20 select-none"
              >–</span
            >
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.cell {
  padding: 0.25rem 0.375rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--muted-foreground);
  border-bottom: 1px solid var(--border);
  border-right: 1px solid var(--border);
}

.header-cell {
  background: var(--muted);
  color: var(--muted-foreground);
  font-weight: 700;
  font-size: 0.6875rem;
  padding: 0.375rem;
}

.break-cell {
  background: rgb(255 251 235 / 0.6);
}
:is(.dark) .break-cell {
  background: rgb(69 26 3 / 0.2);
}

.lesson-cell {
  transition: background-color 0.15s ease;
}

.overlay-cell {
  background: rgb(255 251 235 / 0.4);
}
:is(.dark) .overlay-cell {
  background: rgb(69 26 3 / 0.15);
}

.stripe {
  background: color-mix(in oklch, var(--muted) 30%, transparent);
}

/* Remove bottom border on last row cells */
.schedule-grid > .cell:nth-last-child(-n + v-bind(colCount)) {
  border-bottom: none;
}
</style>
