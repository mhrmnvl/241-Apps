<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Calendar as CalendarIcon, Clock } from 'lucide-vue-next'
import type { CalendarEventData, EventClickInfo } from '../types'

defineProps<{
  todayEvents: CalendarEventData[]
  upcomingEvents: CalendarEventData[]
}>()

const emit = defineEmits<{
  eventClick: [info: EventClickInfo]
}>()

const padZero = (num: number) => num.toString().padStart(2, '0')

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr)
  return `${padZero(d.getHours())}:${padZero(d.getMinutes())}`
}

const formatDateStr = (dateStr: string) => {
  const d = new Date(dateStr)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Agu',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ]
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}
</script>

<template>
  <div class="space-y-6">
    <Card class="border-none shadow-none bg-primary/5">
      <CardHeader class="pb-3 px-4">
        <CardTitle
          class="text-sm font-semibold text-primary flex items-center gap-2"
        >
          <Clock class="size-4" />
          Kegiatan Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent class="px-4 pb-4">
        <div
          v-if="todayEvents.length > 0"
          class="space-y-3"
        >
          <div
            v-for="event in todayEvents"
            :key="event.id"
            class="bg-background rounded-xl p-3 shadow-sm border cursor-pointer hover:border-primary/50 transition-colors"
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
            <div class="font-medium text-sm mb-1 line-clamp-1">
              {{ event.title }}
            </div>
            <div
              class="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"
            >
              <CalendarIcon class="size-3" />
              <span
                >{{ formatTime(event.startDate) }} -
                {{ formatTime(event.endDate) }}</span
              >
            </div>
            <Badge
              variant="secondary"
              class="text-[10px] px-1.5 py-0"
            >
              {{ event.type?.name ?? 'Kegiatan' }}
            </Badge>
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

    <Card class="border-none shadow-none bg-muted/30">
      <CardHeader class="pb-3 px-4">
        <CardTitle class="text-sm font-semibold flex items-center gap-2">
          <CalendarIcon class="size-4" />
          Kegiatan Mendatang
        </CardTitle>
      </CardHeader>
      <CardContent class="px-4 pb-4">
        <div
          v-if="upcomingEvents.length > 0"
          class="space-y-3"
        >
          <div
            v-for="event in upcomingEvents"
            :key="event.id"
            class="bg-background rounded-xl p-3 shadow-sm border cursor-pointer hover:border-primary/50 transition-colors"
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
            <div class="font-medium text-sm mb-1 line-clamp-1">
              {{ event.title }}
            </div>
            <div
              class="text-xs text-muted-foreground flex items-center gap-1.5 mb-2"
            >
              <CalendarIcon class="size-3" />
              <span>{{ formatDateStr(event.startDate) }}</span>
            </div>
            <Badge
              variant="outline"
              class="text-[10px] px-1.5 py-0 bg-background"
            >
              {{ event.type?.name ?? 'Kegiatan' }}
            </Badge>
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
