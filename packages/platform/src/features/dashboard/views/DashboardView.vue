<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Skeleton } from '@/ui/skeleton'
import { Button } from '@/ui/button'
import { useDashboard } from '../composables/useDashboard'
import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  CalendarDays,
  Megaphone,
  Building2,
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  UserCheck,
  UserX,
  Clock,
  FileText,
  RefreshCw,
  ChevronRight,
} from 'lucide-vue-next'

const router = useRouter()

const { summary, loading, fetchSummary } = useDashboard()

const stats = computed(() => summary.value?.statistics)
const academic = computed(() => summary.value?.academicInfo)
const institution = computed(() => summary.value?.institution)
const distributions = computed(() => summary.value?.distributions)
const events = computed(() => summary.value?.upcomingEvents ?? [])
const announcements = computed(() => summary.value?.recentAnnouncements ?? [])
const todayAttendance = computed(() => summary.value?.todayAttendance)

const semesterLabel = computed(() => {
  const type = academic.value?.activeSemester?.type
  if (type === 'ODD') return 'Ganjil'
  if (type === 'EVEN') return 'Genap'
  return type ?? '-'
})

const institutionStatusLabel = computed(() => {
  const status = institution.value?.status?.toUpperCase()
  if (!status) return 'Belum Dikonfigurasi'
  const map: Record<string, string> = {
    NEGERI: 'Negeri',
    SWASTA: 'Swasta',
    PUBLIC: 'Negeri',
    PRIVATE: 'Swasta',
    ACTIVE: 'Aktif',
  }
  return map[status] ?? status
})

const attendanceRate = computed(() => {
  const a = todayAttendance.value
  if (!a) return null
  const total = a.present + a.absent + a.late + a.excused + a.sick
  if (total === 0) return null
  return Math.round((a.present / total) * 100)
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatGradeLevel(level: string | number) {
  const num = Number(level)
  if (!isNaN(num)) return `Kelas ${num}`
  return `Kelas ${level}`
}

function formatEventType(type: string) {
  return type
}

function eventTypeVariant(type: string) {
  const lower = type.toLowerCase()
  const map: Record<
    string,
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    libur: 'destructive',
    ujian: 'default',
    acara: 'secondary',
    rapat: 'outline',
    holiday: 'destructive',
    exam: 'default',
    event: 'secondary',
    meeting: 'outline',
  }
  return map[lower] ?? 'outline'
}

function navigateTo(path: string) {
  void router.push(path)
}

onMounted(() => {
  void fetchSummary()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <!-- Dashboard Top Header -->
      <CardHeader
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b px-6 py-5"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Dashboard
          </CardTitle>
        </div>
        <Button
          variant="outline"
          size="sm"
          class="shrink-0 h-9 gap-2 shadow-2xs"
          :disabled="loading"
          @click="fetchSummary()"
        >
          <RefreshCw
            class="size-3.5"
            :class="{ 'animate-spin': loading }"
          />
          <span>Segarkan Data</span>
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <!-- 1. Institution & Academic Context Banner -->
        <div
          class="rounded-xl border bg-gradient-to-br from-primary/5 via-muted/30 to-background p-4 sm:p-5 shadow-2xs"
        >
          <div
            v-if="loading"
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-3.5">
              <Skeleton class="size-11 rounded-xl" />
              <div class="space-y-2">
                <Skeleton class="h-5 w-48" />
                <Skeleton class="h-3.5 w-32" />
              </div>
            </div>
            <div class="flex flex-wrap gap-2.5">
              <Skeleton class="h-9 w-36 rounded-lg" />
              <Skeleton class="h-9 w-32 rounded-lg" />
            </div>
          </div>

          <div
            v-else
            class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <!-- Left: Institution info with icon -->
            <div class="flex items-center gap-3.5 min-w-0">
              <div
                class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/20"
              >
                <Building2 class="size-5" />
              </div>
              <div class="space-y-0.5 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h3
                    class="text-base sm:text-lg font-bold tracking-tight truncate"
                  >
                    {{ institution?.name ?? 'Belum Dikonfigurasi' }}
                  </h3>
                  <Badge
                    v-if="institution?.status"
                    variant="secondary"
                    class="text-xs font-medium"
                  >
                    {{ institutionStatusLabel }}
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground">
                  Informasi akademik dan operasional institusi
                </p>
              </div>
            </div>

            <!-- Right: Active Academic Year & Semester chips -->
            <div class="flex flex-wrap items-center gap-2.5 shrink-0">
              <div
                class="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 shadow-2xs"
              >
                <CalendarDays class="size-4 text-primary" />
                <div class="text-xs">
                  <span class="text-muted-foreground">Tahun Ajaran: </span>
                  <span class="font-semibold">{{
                    academic?.activeAcademicYear?.name ?? '-'
                  }}</span>
                </div>
              </div>

              <div
                class="flex items-center gap-2 rounded-lg border bg-card px-3.5 py-2 shadow-2xs"
              >
                <CalendarCheck class="size-4 text-primary" />
                <div class="text-xs">
                  <span class="text-muted-foreground">Semester: </span>
                  <span class="font-semibold">{{ semesterLabel }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. Key Statistics Cards -->
        <div class="grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-5">
          <!-- Total Siswa -->
          <Card
            class="shadow-2xs border transition-all duration-200 hover:shadow-md hover:border-blue-500/40 cursor-pointer group relative overflow-hidden"
            @click="navigateTo('/student')"
          >
            <CardContent class="p-4 sm:p-5">
              <div
                v-if="loading"
                class="space-y-3"
              >
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-8 w-16" />
              </div>
              <div
                v-else
                class="flex items-start justify-between"
              >
                <div>
                  <p class="text-xs font-medium text-muted-foreground">
                    Total Siswa
                  </p>
                  <p
                    class="mt-1.5 text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight"
                  >
                    {{ stats?.totalStudents ?? 0 }}
                  </p>
                  <p
                    class="mt-1 text-[11px] text-muted-foreground flex items-center gap-1"
                  >
                    <span>Siswa aktif</span>
                    <ChevronRight
                      class="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600"
                    />
                  </p>
                </div>
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-110 shadow-xs"
                >
                  <Users class="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Total Guru -->
          <Card
            class="shadow-2xs border transition-all duration-200 hover:shadow-md hover:border-emerald-500/40 cursor-pointer group relative overflow-hidden"
            @click="navigateTo('/teacher')"
          >
            <CardContent class="p-4 sm:p-5">
              <div
                v-if="loading"
                class="space-y-3"
              >
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-8 w-16" />
              </div>
              <div
                v-else
                class="flex items-start justify-between"
              >
                <div>
                  <p class="text-xs font-medium text-muted-foreground">
                    Total Guru
                  </p>
                  <p
                    class="mt-1.5 text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight"
                  >
                    {{ stats?.totalTeachers ?? 0 }}
                  </p>
                  <p
                    class="mt-1 text-[11px] text-muted-foreground flex items-center gap-1"
                  >
                    <span>Pengajar terdaftar</span>
                    <ChevronRight
                      class="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600"
                    />
                  </p>
                </div>
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-110 shadow-xs"
                >
                  <GraduationCap class="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Guru Mengajar -->
          <Card
            class="shadow-2xs border transition-all duration-200 hover:shadow-md hover:border-teal-500/40 cursor-pointer group relative overflow-hidden"
            @click="navigateTo('/learning/teaching-assignment')"
          >
            <CardContent class="p-4 sm:p-5">
              <div
                v-if="loading"
                class="space-y-3"
              >
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-8 w-16" />
              </div>
              <div
                v-else
                class="flex items-start justify-between"
              >
                <div>
                  <p class="text-xs font-medium text-muted-foreground">
                    Guru Mengajar
                  </p>
                  <p
                    class="mt-1.5 text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight"
                  >
                    {{ stats?.totalInstructors ?? 0 }}
                  </p>
                  <p
                    class="mt-1 text-[11px] text-muted-foreground flex items-center gap-1"
                  >
                    <span>Punya penugasan</span>
                    <ChevronRight
                      class="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-teal-600"
                    />
                  </p>
                </div>
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 transition-transform group-hover:scale-110 shadow-xs"
                >
                  <Users class="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Kelas -->
          <Card
            class="shadow-2xs border transition-all duration-200 hover:shadow-md hover:border-amber-500/40 cursor-pointer group relative overflow-hidden"
            @click="navigateTo('/academic/classroom')"
          >
            <CardContent class="p-4 sm:p-5">
              <div
                v-if="loading"
                class="space-y-3"
              >
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-8 w-16" />
              </div>
              <div
                v-else
                class="flex items-start justify-between"
              >
                <div>
                  <p class="text-xs font-medium text-muted-foreground">
                    Kelas Aktif
                  </p>
                  <p
                    class="mt-1.5 text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight"
                  >
                    {{ stats?.totalClasses ?? 0 }}
                  </p>
                  <p
                    class="mt-1 text-[11px] text-muted-foreground flex items-center gap-1"
                  >
                    <span>Rombongan belajar</span>
                    <ChevronRight
                      class="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600"
                    />
                  </p>
                </div>
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-transform group-hover:scale-110 shadow-xs"
                >
                  <School class="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Mata Pelajaran -->
          <Card
            class="shadow-2xs border transition-all duration-200 hover:shadow-md hover:border-rose-500/40 cursor-pointer group relative overflow-hidden col-span-2 sm:col-span-1"
            @click="navigateTo('/learning/subject')"
          >
            <CardContent class="p-4 sm:p-5">
              <div
                v-if="loading"
                class="space-y-3"
              >
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-8 w-16" />
              </div>
              <div
                v-else
                class="flex items-start justify-between"
              >
                <div>
                  <p class="text-xs font-medium text-muted-foreground">
                    Mata Pelajaran
                  </p>
                  <p
                    class="mt-1.5 text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight"
                  >
                    {{ stats?.totalSubjects ?? 0 }}
                  </p>
                  <p
                    class="mt-1 text-[11px] text-muted-foreground flex items-center gap-1"
                  >
                    <span>Mapel kurikulum</span>
                    <ChevronRight
                      class="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-rose-600"
                    />
                  </p>
                </div>
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 transition-transform group-hover:scale-110 shadow-xs"
                >
                  <BookOpen class="size-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- 3. Today Attendance -->
        <Card class="shadow-2xs border">
          <CardHeader class="border-b px-5 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <ClipboardCheck class="size-4" />
                </div>
                <div>
                  <CardTitle class="text-sm font-semibold">
                    Kehadiran Siswa Hari Ini
                  </CardTitle>
                  <p class="text-[11px] text-muted-foreground">
                    Rekap status kehadiran seluruh kelas hari ini
                  </p>
                </div>
              </div>
              <Badge
                v-if="attendanceRate !== null"
                variant="outline"
                class="text-xs font-semibold px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
              >
                {{ attendanceRate }}% Kehadiran
              </Badge>
            </div>
          </CardHeader>
          <CardContent class="p-5">
            <div
              v-if="loading"
              class="grid grid-cols-2 gap-3 sm:grid-cols-5"
            >
              <Skeleton
                v-for="i in 5"
                :key="i"
                class="h-20 w-full rounded-xl"
              />
            </div>
            <div
              v-else-if="todayAttendance"
              class="grid grid-cols-2 gap-3 sm:grid-cols-5"
            >
              <!-- Hadir -->
              <div
                class="flex flex-col items-center justify-center rounded-xl border border-emerald-200/60 bg-emerald-50/50 p-3.5 text-center transition-all hover:bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
              >
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 mb-1.5"
                >
                  <UserCheck class="size-4" />
                </div>
                <p
                  class="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400"
                >
                  {{ todayAttendance.present }}
                </p>
                <p class="text-xs font-medium text-muted-foreground mt-0.5">
                  Hadir
                </p>
              </div>

              <!-- Alpha -->
              <div
                class="flex flex-col items-center justify-center rounded-xl border border-rose-200/60 bg-rose-50/50 p-3.5 text-center transition-all hover:bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/20"
              >
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 mb-1.5"
                >
                  <UserX class="size-4" />
                </div>
                <p
                  class="text-2xl font-bold tabular-nums text-rose-700 dark:text-rose-400"
                >
                  {{ todayAttendance.absent }}
                </p>
                <p class="text-xs font-medium text-muted-foreground mt-0.5">
                  Alpha
                </p>
              </div>

              <!-- Terlambat -->
              <div
                class="flex flex-col items-center justify-center rounded-xl border border-amber-200/60 bg-amber-50/50 p-3.5 text-center transition-all hover:bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20"
              >
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 mb-1.5"
                >
                  <Clock class="size-4" />
                </div>
                <p
                  class="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400"
                >
                  {{ todayAttendance.late }}
                </p>
                <p class="text-xs font-medium text-muted-foreground mt-0.5">
                  Terlambat
                </p>
              </div>

              <!-- Izin -->
              <div
                class="flex flex-col items-center justify-center rounded-xl border border-blue-200/60 bg-blue-50/50 p-3.5 text-center transition-all hover:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/20"
              >
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 mb-1.5"
                >
                  <FileText class="size-4" />
                </div>
                <p
                  class="text-2xl font-bold tabular-nums text-blue-700 dark:text-blue-400"
                >
                  {{ todayAttendance.excused }}
                </p>
                <p class="text-xs font-medium text-muted-foreground mt-0.5">
                  Izin
                </p>
              </div>

              <!-- Sakit -->
              <div
                class="flex flex-col items-center justify-center rounded-xl border border-purple-200/60 bg-purple-50/50 p-3.5 text-center transition-all hover:bg-purple-50 dark:border-purple-900/40 dark:bg-purple-950/20 col-span-2 sm:col-span-1"
              >
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 mb-1.5"
                >
                  <FileText class="size-4" />
                </div>
                <p
                  class="text-2xl font-bold tabular-nums text-purple-700 dark:text-purple-400"
                >
                  {{ todayAttendance.sick }}
                </p>
                <p class="text-xs font-medium text-muted-foreground mt-0.5">
                  Sakit
                </p>
              </div>
            </div>
            <div
              v-else
              class="flex flex-col items-center justify-center py-8 text-center"
            >
              <ClipboardCheck class="size-8 text-muted-foreground/30 mb-2" />
              <p class="text-xs text-muted-foreground">
                Belum ada data kehadiran yang diinput untuk hari ini.
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- 4. Distributions & Events (2-Column Grid) -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Distribusi Siswa per Tingkat -->
          <Card class="shadow-2xs border">
            <CardHeader class="border-b px-5 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <BarChart3 class="size-4" />
                  </div>
                  <div>
                    <CardTitle class="text-sm font-semibold">
                      Distribusi Siswa per Tingkat
                    </CardTitle>
                    <p class="text-[11px] text-muted-foreground">
                      Komposisi siswa berdasarkan jenjang kelas
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-3"
              >
                <Skeleton
                  v-for="i in 4"
                  :key="i"
                  class="h-10 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="distributions?.studentsByGrade?.length"
                class="space-y-3"
              >
                <div
                  v-for="item in distributions.studentsByGrade"
                  :key="item.grade"
                  class="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  <span class="text-sm font-semibold text-foreground">
                    {{ formatGradeLevel(item.grade) }}
                  </span>
                  <div class="flex items-center gap-3.5">
                    <div
                      class="h-2.5 w-24 sm:w-32 overflow-hidden rounded-full bg-muted"
                    >
                      <div
                        class="h-full rounded-full bg-primary transition-all duration-300"
                        :style="{
                          width: `${Math.min(100, (item.totalStudents / Math.max(1, stats?.totalStudents ?? 1)) * 100)}%`,
                        }"
                      />
                    </div>
                    <span
                      class="min-w-[4ch] text-right text-sm font-bold tabular-nums"
                    >
                      {{ item.totalStudents }}
                      <span
                        class="text-[10px] font-normal text-muted-foreground ml-0.5"
                        >siswa</span
                      >
                    </span>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="flex flex-col items-center justify-center py-8 text-center"
              >
                <BarChart3 class="size-8 text-muted-foreground/30 mb-2" />
                <p class="text-xs text-muted-foreground">
                  Belum ada data distribusi siswa per tingkat.
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Kegiatan Mendatang -->
          <Card class="shadow-2xs border">
            <CardHeader class="border-b px-5 py-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div
                    class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                  >
                    <CalendarDays class="size-4" />
                  </div>
                  <div>
                    <CardTitle class="text-sm font-semibold">
                      Kegiatan Mendatang
                    </CardTitle>
                    <p class="text-[11px] text-muted-foreground">
                      Jadwal agenda kalender pendidikan terdekat
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-3"
              >
                <Skeleton
                  v-for="i in 3"
                  :key="i"
                  class="h-14 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="events.length"
                class="space-y-2.5"
              >
                <div
                  v-for="event in events"
                  :key="event.id"
                  class="flex items-start gap-3 rounded-xl border bg-card p-3 hover:border-primary/30 transition-all"
                >
                  <!-- Date Block -->
                  <div
                    class="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-2.5 py-1 text-center shrink-0 border border-primary/20"
                  >
                    <span
                      class="text-[10px] font-bold uppercase tracking-wider text-primary"
                    >
                      {{
                        new Date(event.startDate).toLocaleDateString('id-ID', {
                          month: 'short',
                        })
                      }}
                    </span>
                    <span
                      class="text-lg font-black leading-tight text-primary tabular-nums"
                    >
                      {{ new Date(event.startDate).getDate() }}
                    </span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold truncate text-foreground">
                      {{ event.title }}
                    </p>
                    <p class="text-xs text-muted-foreground mt-0.5">
                      {{ formatDate(event.startDate) }}
                      <template v-if="event.startDate !== event.endDate">
                        — {{ formatDate(event.endDate) }}
                      </template>
                    </p>
                  </div>
                  <Badge
                    :variant="eventTypeVariant(event.type)"
                    class="shrink-0 text-[10px] font-medium"
                  >
                    {{ formatEventType(event.type) }}
                  </Badge>
                </div>
              </div>
              <div
                v-else
                class="flex flex-col items-center justify-center py-8 text-center"
              >
                <CalendarDays class="size-8 text-muted-foreground/30 mb-2" />
                <p class="text-xs text-muted-foreground">
                  Tidak ada agenda kegiatan terdekat pada kalender.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- 5. Distribusi Pegawai & Pengumuman Terbaru -->
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Distribusi Pegawai per Jabatan -->
          <Card class="shadow-2xs border">
            <CardHeader class="border-b px-5 py-4">
              <div class="flex items-center gap-2.5">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <Users class="size-4" />
                </div>
                <div>
                  <CardTitle class="text-sm font-semibold">
                    Distribusi Pegawai per Jabatan
                  </CardTitle>
                  <p class="text-[11px] text-muted-foreground">
                    Komposisi tenaga pendidik dan kependidikan
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-2.5"
              >
                <Skeleton
                  v-for="i in 3"
                  :key="i"
                  class="h-10 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="distributions?.teachersByPosition?.length"
                class="space-y-2.5"
              >
                <div
                  v-for="item in distributions.teachersByPosition"
                  :key="item.category"
                  class="flex items-center justify-between rounded-lg border bg-muted/20 px-4 py-2.5 hover:bg-muted/40 transition-colors"
                >
                  <span class="text-sm font-medium text-foreground">
                    {{ item.category ?? 'Tidak Berkategori' }}
                  </span>
                  <Badge
                    variant="secondary"
                    class="tabular-nums font-semibold px-2"
                  >
                    {{ item.total }}
                    <span
                      class="text-[10px] font-normal text-muted-foreground ml-1"
                      >orang</span
                    >
                  </Badge>
                </div>
              </div>
              <div
                v-else
                class="flex flex-col items-center justify-center py-8 text-center"
              >
                <Users class="size-8 text-muted-foreground/30 mb-2" />
                <p class="text-xs text-muted-foreground">
                  Belum ada data distribusi jabatan pegawai.
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Pengumuman Terbaru -->
          <Card class="shadow-2xs border">
            <CardHeader class="border-b px-5 py-4">
              <div class="flex items-center gap-2.5">
                <div
                  class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <Megaphone class="size-4" />
                </div>
                <div>
                  <CardTitle class="text-sm font-semibold">
                    Pengumuman Terbaru
                  </CardTitle>
                  <p class="text-[11px] text-muted-foreground">
                    Warta dan informasi resmi sekolah
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-2.5"
              >
                <Skeleton
                  v-for="i in 3"
                  :key="i"
                  class="h-12 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="announcements.length"
                class="space-y-2.5"
              >
                <div
                  v-for="ann in announcements"
                  :key="ann.id"
                  class="flex flex-col gap-1 rounded-xl border bg-card p-3.5 hover:border-primary/30 transition-colors"
                >
                  <p
                    class="text-sm font-semibold text-foreground break-words leading-snug"
                  >
                    {{ ann.title }}
                  </p>
                  <span
                    class="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"
                  >
                    <Clock class="size-3 text-muted-foreground/70" />
                    {{ formatDate(ann.date) }}
                  </span>
                </div>
              </div>
              <div
                v-else
                class="flex flex-col items-center justify-center py-8 text-center"
              >
                <Megaphone class="size-8 text-muted-foreground/30 mb-2" />
                <p class="text-xs text-muted-foreground">
                  Belum ada pengumuman terbaru yang dipublikasikan.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  </div>
</template>
