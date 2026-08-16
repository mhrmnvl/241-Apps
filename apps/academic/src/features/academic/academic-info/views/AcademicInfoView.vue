<script setup lang="ts">
import { onMounted } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import { CalendarDays, BookOpen, Megaphone } from 'lucide-vue-next'
import { useAcademicInfo } from '../composables/useAcademicInfo'

const {
  todayLabel,
  todayLessons,
  upcomingEvents,
  recentAnnouncements,
  isLoadingSchedule,
  isLoadingEvents,
  isLoadingAnnouncements,
  init,
} = useAcademicInfo()

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

onMounted(init)
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8 space-y-6">
    <!-- Jadwal Hari Ini -->
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader class="flex flex-row items-center gap-3 border-b px-6 py-5">
        <BookOpen class="size-5 text-primary" />
        <div>
          <CardTitle class="text-xl font-bold tracking-tight">
            Jadwal Hari Ini
          </CardTitle>
          <p class="text-sm text-muted-foreground mt-0.5">{{ todayLabel }}</p>
        </div>
      </CardHeader>
      <CardContent class="p-6">
        <div
          v-if="isLoadingSchedule"
          class="space-y-3"
        >
          <Skeleton
            v-for="i in 4"
            :key="i"
            class="h-14 w-full rounded-xl"
          />
        </div>
        <div
          v-else-if="todayLessons.length === 0"
          class="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-xl"
        >
          Tidak ada pelajaran hari ini.
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="row in todayLessons"
            :key="row.timeSlot.id"
            class="flex items-center gap-4 rounded-xl border bg-muted/30 px-4 py-3"
          >
            <div
              class="flex flex-col items-center justify-center min-w-[56px] text-center"
            >
              <span class="text-xs font-semibold text-primary">{{
                row.timeSlot.startTime
              }}</span>
              <span class="text-[10px] text-muted-foreground">{{
                row.timeSlot.endTime
              }}</span>
            </div>
            <div class="h-8 w-px bg-border" />
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm truncate">
                {{ row.lesson?.subject?.name ?? '-' }}
              </p>
              <p class="text-xs text-muted-foreground truncate">
                {{
                  row.lesson?.teacher?.user?.profile?.name ??
                  'Guru belum diatur'
                }}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div class="grid gap-6 md:grid-cols-2">
      <!-- Kegiatan Mendatang -->
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader class="flex flex-row items-center gap-3 border-b px-6 py-5">
          <CalendarDays class="size-5 text-primary" />
          <CardTitle class="text-xl font-bold tracking-tight">
            Kegiatan Mendatang
          </CardTitle>
        </CardHeader>
        <CardContent class="p-6">
          <div
            v-if="isLoadingEvents"
            class="space-y-3"
          >
            <Skeleton
              v-for="i in 3"
              :key="i"
              class="h-14 w-full rounded-xl"
            />
          </div>
          <div
            v-else-if="upcomingEvents.length === 0"
            class="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-xl"
          >
            Tidak ada kegiatan mendatang.
          </div>
          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="event in upcomingEvents"
              :key="event.id"
              class="rounded-xl border bg-muted/30 px-4 py-3"
            >
              <div class="flex items-start justify-between gap-2">
                <p class="font-semibold text-sm line-clamp-1">
                  {{ event.title }}
                </p>
                <Badge
                  variant="secondary"
                  class="shrink-0 text-xs"
                >
                  {{ formatDate(event.startDate) }}
                </Badge>
              </div>
              <p
                v-if="event.description"
                class="text-xs text-muted-foreground mt-1 line-clamp-2"
              >
                {{ event.description }}
              </p>
              <!--
                A calendar entry spans days, not hours: a holiday is the 17th,
                a term is July to December. Printing a clock time here meant
                every entry claimed to start at midnight.
              -->
              <div
                v-if="event.endDate !== event.startDate || event.startTime"
                class="flex items-center gap-1 mt-1.5 text-xs text-muted-foreground"
              >
                <CalendarDays class="size-3" />
                <span v-if="event.endDate !== event.startDate">
                  {{ formatDate(event.startDate) }} –
                  {{ formatDate(event.endDate) }}
                </span>
                <span v-if="event.startTime && event.endTime">
                  {{ event.startTime.slice(11, 16) }} –
                  {{ event.endTime.slice(11, 16) }}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Pengumuman Terbaru -->
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader class="flex flex-row items-center gap-3 border-b px-6 py-5">
          <Megaphone class="size-5 text-primary" />
          <CardTitle class="text-xl font-bold tracking-tight">
            Pengumuman Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent class="p-6">
          <div
            v-if="isLoadingAnnouncements"
            class="space-y-3"
          >
            <Skeleton
              v-for="i in 3"
              :key="i"
              class="h-14 w-full rounded-xl"
            />
          </div>
          <div
            v-else-if="recentAnnouncements.length === 0"
            class="text-center text-sm text-muted-foreground py-10 border border-dashed rounded-xl"
          >
            Tidak ada pengumuman terbaru.
          </div>
          <div
            v-else
            class="space-y-3"
          >
            <div
              v-for="item in recentAnnouncements"
              :key="item.id"
              class="rounded-xl border bg-muted/30 px-4 py-3"
            >
              <div class="flex items-start justify-between gap-2">
                <p class="font-semibold text-sm line-clamp-1">
                  {{ item.title }}
                </p>
                <span
                  class="shrink-0 text-xs text-muted-foreground whitespace-nowrap"
                >
                  {{
                    new Date(item.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })
                  }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-1 line-clamp-2">
                {{ item.description }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
