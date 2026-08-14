<script setup lang="ts">
import { formatEntityName } from '@/shared/utils/utils'
import { BookOpen } from 'lucide-vue-next'
import { Card, CardHeader, CardContent } from '@/ui/card'
import type {
  ScheduleDay,
  ScheduleClassroom,
  ScheduleTimeSlot,
  ScheduleLessonMap,
} from '../types'

defineProps<{
  isPersonal: boolean
  user: { identifier?: string } | null
  selectedClassroom: ScheduleClassroom | undefined
  sortedTimeSlots: ScheduleTimeSlot[]
  days: ScheduleDay[]
  lessonMap: ScheduleLessonMap
}>()

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
      return `${h}.${m}`
    }
  } catch {
    // no-op fallback
  }
  return String(val).substring(0, 5).replace(':', '.')
}
</script>

<template>
  <Card
    class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
  >
    <CardHeader
      class="flex flex-row items-center gap-2 border-b px-6 py-3 bg-muted/30"
    >
      <BookOpen class="size-4 text-primary shrink-0" />
      <span class="font-semibold text-sm">
        <template v-if="isPersonal">
          Jadwal Mengajar - {{ user?.identifier }}
        </template>
        <template v-else>
          Kelas
          {{ selectedClassroom?.code ?? selectedClassroom?.name ?? 'Terpilih' }}
        </template>
      </span>
    </CardHeader>

    <CardContent class="overflow-x-auto p-0">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-muted/40 text-muted-foreground">
            <th
              class="border-b border-r px-4 py-3 text-left font-semibold w-32"
            >
              Jam
            </th>
            <th
              class="border-b border-r px-4 py-3 text-center font-semibold w-36"
            >
              Pukul
            </th>
            <th
              v-for="day in days"
              :key="day.value"
              class="border-b border-r px-4 py-3 text-center font-semibold min-w-[130px] last:border-r-0"
            >
              {{ day.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <template
            v-for="(ts, idx) in sortedTimeSlots"
            :key="ts.id"
          >
            <tr
              v-if="ts.isLesson === false"
              class="bg-amber-50/60 dark:bg-amber-950/20"
            >
              <td class="border-b border-r px-4 py-2.5">
                <span
                  class="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400"
                >
                  {{ formatEntityName(ts.name) }}
                </span>
              </td>
              <td
                class="border-b border-r px-4 py-2.5 text-center font-mono text-xs text-muted-foreground"
              >
                {{ formatPukul(ts.startTime, ts.endTime) }}
              </td>
              <td
                :colspan="days.length"
                class="border-b px-4 py-2.5 text-center text-xs text-muted-foreground italic"
              >
                {{ ts.typeName ?? formatEntityName(ts.name) }}
              </td>
            </tr>

            <tr
              v-else
              class="hover:bg-muted/10 transition-colors"
              :class="idx % 2 === 1 ? 'bg-muted/5' : ''"
            >
              <td
                class="border-b border-r px-4 py-3 text-sm font-medium text-muted-foreground"
              >
                {{ formatEntityName(ts.name) }}
              </td>
              <td
                class="border-b border-r px-4 py-3 text-center font-mono text-xs text-muted-foreground whitespace-nowrap"
              >
                {{ formatPukul(ts.startTime, ts.endTime) }}
              </td>
              <td
                v-for="day in days"
                :key="day.value"
                class="border-b border-r px-3 py-2.5 text-center last:border-r-0"
              >
                <template v-if="lessonMap[ts.id]?.[day.value]">
                  <div
                    class="font-semibold text-foreground text-sm leading-tight"
                  >
                    {{ lessonMap[ts.id]?.[day.value]?.subject?.name ?? '–' }}
                  </div>

                  <div
                    v-if="
                      isPersonal &&
                      lessonMap[ts.id]?.[day.value]?.classroom?.name
                    "
                    class="text-[11px] text-primary/80 font-medium mt-0.5 truncate max-w-[120px] mx-auto"
                  >
                    {{
                      lessonMap[ts.id]?.[day.value]?.classroom?.code ??
                      lessonMap[ts.id]?.[day.value]?.classroom?.name ??
                      '-'
                    }}
                  </div>

                  <div
                    v-else-if="
                      !isPersonal &&
                      lessonMap[ts.id]?.[day.value]?.teacher?.user?.profile
                        ?.name
                    "
                    class="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[120px] mx-auto"
                  >
                    {{
                      lessonMap[ts.id]?.[day.value]?.teacher?.user?.profile
                        ?.name
                    }}
                  </div>
                </template>
                <span
                  v-else
                  class="text-muted-foreground/25 select-none text-base"
                  >–</span
                >
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </CardContent>
  </Card>
</template>
