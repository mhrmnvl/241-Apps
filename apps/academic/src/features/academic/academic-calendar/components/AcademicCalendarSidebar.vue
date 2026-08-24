<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Calendar as CalendarIcon, ChevronRight, Clock } from 'lucide-vue-next'
import type { CalendarEventData, EventClickInfo } from '../types'
import { useCalendarFormat } from '../composables/useCalendarFormat'

defineProps<{
  todayEvents: CalendarEventData[]
  upcomingEvents: CalendarEventData[]
}>()

const emit = defineEmits<{
  eventClick: [info: EventClickInfo]
}>()

// The same function, month array and all, used to live here too.
const { formatDateStr } = useCalendarFormat()
</script>

<template>
  <div class="space-y-6">
    <!-- Kegiatan Hari Ini -->
    <Card class="bg-primary/5">
      <CardHeader class="border-b px-4 py-3">
        <CardTitle
          class="text-sm font-semibold text-primary flex items-center gap-2"
        >
          <Clock class="size-4" />
          Kegiatan Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent class="p-3 pt-0">
        <div
          v-if="todayEvents.length > 0"
          class="rounded-xl border bg-background divide-y divide-border/60 overflow-hidden shadow-xs"
        >
          <div
            v-for="event in todayEvents"
            :key="event.id"
            class="group flex items-center justify-between gap-3 p-3 hover:bg-muted/40 cursor-pointer transition-colors"
            @click="
              emit('eventClick', {
                event: {
                  id: event.id,
                  title: event.title,
                  extendedProps: event,
                },
              })
            "
          >
            <div
              class="font-medium text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1"
            >
              {{ event.title }}
            </div>
            <ChevronRight
              class="size-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </div>
        </div>
        <div
          v-else
          class="text-sm text-muted-foreground text-center py-6 bg-background/50 rounded-xl border border-dashed"
        >
          Tidak ada kegiatan hari ini
        </div>
      </CardContent>
    </Card>

    <!-- Kegiatan Mendatang -->
    <Card class="bg-muted/30">
      <CardHeader class="border-b px-4 py-3">
        <CardTitle class="text-sm font-semibold flex items-center gap-2">
          <CalendarIcon class="size-4" />
          Kegiatan Mendatang
        </CardTitle>
      </CardHeader>
      <CardContent class="p-3 pt-0">
        <div
          v-if="upcomingEvents.length > 0"
          class="rounded-xl border bg-background divide-y divide-border/60 overflow-hidden shadow-xs"
        >
          <div
            v-for="event in upcomingEvents"
            :key="event.id"
            class="group flex items-center justify-between gap-3 p-3 hover:bg-muted/40 cursor-pointer transition-colors"
            @click="
              emit('eventClick', {
                event: {
                  id: event.id,
                  title: event.title,
                  extendedProps: event,
                },
              })
            "
          >
            <div class="min-w-0 flex-1">
              <div
                class="font-medium text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1"
              >
                {{ event.title }}
              </div>
              <div class="text-[11px] text-muted-foreground mt-0.5">
                {{ formatDateStr(event.startDate) }}
              </div>
            </div>
            <ChevronRight
              class="size-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </div>
        </div>
        <div
          v-else
          class="text-sm text-muted-foreground text-center py-6 bg-background/50 rounded-xl border border-dashed"
        >
          Tidak ada kegiatan mendatang
        </div>
      </CardContent>
    </Card>
  </div>
</template>
