<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Separator } from '@/ui/separator'
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
  ShieldCheck,
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
const pendingAdmissions = computed(() => summary.value?.pendingAdmissions ?? 0)

const semesterLabel = computed(() => {
  const type = academic.value?.activeSemester?.type
  if (type === 'ODD') return 'Ganjil'
  if (type === 'EVEN') return 'Genap'
  return type ?? '-'
})

const institutionStatusLabel = computed(() => {
  const status = institution.value?.status
  if (!status) return 'Belum Dikonfigurasi'
  const map: Record<string, string> = {
    NEGERI: 'Negeri',
    SWASTA: 'Swasta',
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
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Dashboard
          </CardTitle>
          <p class="mt-1 text-sm text-muted-foreground">
            Ringkasan data dan informasi akademik terkini.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          :disabled="loading"
          @click="fetchSummary()"
        >
          <RefreshCw
            class="size-3.5"
            :class="{ 'animate-spin': loading }"
          />
          Refresh
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <!-- Institution & Academic Context -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card class="shadow-none">
            <CardContent class="p-4">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton class="h-4 w-16" />
                <Skeleton class="h-6 w-32" />
              </div>
              <div
                v-else
                class="flex items-start gap-3"
              >
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                >
                  <Building2 class="size-4 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-muted-foreground">
                    Institusi
                  </p>
                  <p class="text-sm font-semibold break-words">
                    {{ institution?.name ?? 'Belum Dikonfigurasi' }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-none">
            <CardContent class="p-4">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton class="h-4 w-20" />
                <Skeleton class="h-6 w-28" />
              </div>
              <div
                v-else
                class="flex items-start gap-3"
              >
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                >
                  <CalendarDays class="size-4 text-primary" />
                </div>
                <div>
                  <p class="text-xs font-medium text-muted-foreground">
                    Tahun Ajaran Aktif
                  </p>
                  <p class="text-sm font-semibold">
                    {{ academic?.activeAcademicYear?.name ?? '-' }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-none">
            <CardContent class="p-4">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton class="h-4 w-16" />
                <Skeleton class="h-6 w-20" />
              </div>
              <div
                v-else
                class="flex items-start gap-3"
              >
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                >
                  <CalendarCheck class="size-4 text-primary" />
                </div>
                <div>
                  <p class="text-xs font-medium text-muted-foreground">
                    Semester
                  </p>
                  <p class="text-sm font-semibold">
                    {{ semesterLabel }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="shadow-none">
            <CardContent class="p-4">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton class="h-4 w-12" />
                <Skeleton class="h-6 w-16" />
              </div>
              <div
                v-else
                class="flex items-start gap-3"
              >
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10"
                >
                  <ShieldCheck class="size-4 text-primary" />
                </div>
                <div>
                  <p class="text-xs font-medium text-muted-foreground">
                    Status
                  </p>
                  <Badge variant="secondary">
                    {{ institutionStatusLabel }}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <!-- Key Statistics -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card
            class="shadow-none cursor-pointer transition-colors hover:bg-muted/30"
            @click="navigateTo('/students')"
          >
            <CardContent class="p-4">
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
                  <p class="mt-1 text-2xl font-bold tabular-nums">
                    {{ stats?.totalStudents ?? 0 }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-muted-foreground">
                    Siswa terdaftar aktif
                  </p>
                </div>
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10"
                >
                  <Users class="size-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            class="shadow-none cursor-pointer transition-colors hover:bg-muted/30"
            @click="navigateTo('/teachers')"
          >
            <CardContent class="p-4">
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
                  <p class="mt-1 text-2xl font-bold tabular-nums">
                    {{ stats?.totalTeachers ?? 0 }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-muted-foreground">
                    Pengajar aktif
                  </p>
                </div>
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10"
                >
                  <GraduationCap class="size-4 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            class="shadow-none cursor-pointer transition-colors hover:bg-muted/30"
            @click="navigateTo('/teachers')"
          >
            <CardContent class="p-4">
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
                  <p class="mt-1 text-2xl font-bold tabular-nums">
                    {{ stats?.totalInstructors ?? 0 }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-muted-foreground">
                    Punya jadwal mengajar
                  </p>
                </div>
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10"
                >
                  <Users class="size-4 text-teal-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            class="shadow-none cursor-pointer transition-colors hover:bg-muted/30"
            @click="navigateTo('/classrooms')"
          >
            <CardContent class="p-4">
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
                  <p class="text-xs font-medium text-muted-foreground">Kelas</p>
                  <p class="mt-1 text-2xl font-bold tabular-nums">
                    {{ stats?.totalClasses ?? 0 }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-muted-foreground">
                    Kelas aktif
                  </p>
                </div>
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10"
                >
                  <School class="size-4 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            class="shadow-none cursor-pointer transition-colors hover:bg-muted/30"
            @click="navigateTo('/subjects')"
          >
            <CardContent class="p-4">
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
                  <p class="mt-1 text-2xl font-bold tabular-nums">
                    {{ stats?.totalSubjects ?? 0 }}
                  </p>
                  <p class="mt-0.5 text-[11px] text-muted-foreground">
                    Mapel terdaftar
                  </p>
                </div>
                <div
                  class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10"
                >
                  <BookOpen class="size-4 text-rose-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <!-- Today Attendance + Pending Admissions -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Today Attendance -->
          <Card class="shadow-none lg:col-span-2">
            <CardHeader class="border-b px-5 py-3.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <ClipboardCheck class="size-4 text-muted-foreground" />
                  <CardTitle class="text-sm font-semibold">
                    Kehadiran Hari Ini
                  </CardTitle>
                </div>
                <span
                  v-if="attendanceRate !== null"
                  class="text-xs font-medium text-muted-foreground"
                >
                  {{ attendanceRate }}% hadir
                </span>
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
                  class="h-16 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="todayAttendance"
                class="grid grid-cols-2 gap-3 sm:grid-cols-5"
              >
                <div
                  class="flex flex-col items-center rounded-lg border bg-emerald-50 px-3 py-3 dark:bg-emerald-950/20"
                >
                  <UserCheck class="mb-1 size-4 text-emerald-600" />
                  <p
                    class="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400"
                  >
                    {{ todayAttendance.present }}
                  </p>
                  <p class="text-[10px] font-medium text-muted-foreground">
                    Hadir
                  </p>
                </div>
                <div
                  class="flex flex-col items-center rounded-lg border bg-red-50 px-3 py-3 dark:bg-red-950/20"
                >
                  <UserX class="mb-1 size-4 text-red-600" />
                  <p
                    class="text-xl font-bold tabular-nums text-red-700 dark:text-red-400"
                  >
                    {{ todayAttendance.absent }}
                  </p>
                  <p class="text-[10px] font-medium text-muted-foreground">
                    Alpha
                  </p>
                </div>
                <div
                  class="flex flex-col items-center rounded-lg border bg-amber-50 px-3 py-3 dark:bg-amber-950/20"
                >
                  <Clock class="mb-1 size-4 text-amber-600" />
                  <p
                    class="text-xl font-bold tabular-nums text-amber-700 dark:text-amber-400"
                  >
                    {{ todayAttendance.late }}
                  </p>
                  <p class="text-[10px] font-medium text-muted-foreground">
                    Terlambat
                  </p>
                </div>
                <div
                  class="flex flex-col items-center rounded-lg border px-3 py-3"
                >
                  <FileText class="mb-1 size-4 text-blue-600" />
                  <p
                    class="text-xl font-bold tabular-nums text-blue-700 dark:text-blue-400"
                  >
                    {{ todayAttendance.excused }}
                  </p>
                  <p class="text-[10px] font-medium text-muted-foreground">
                    Izin
                  </p>
                </div>
                <div
                  class="flex flex-col items-center rounded-lg border px-3 py-3"
                >
                  <FileText class="mb-1 size-4 text-violet-600" />
                  <p
                    class="text-xl font-bold tabular-nums text-violet-700 dark:text-violet-400"
                  >
                    {{ todayAttendance.sick }}
                  </p>
                  <p class="text-[10px] font-medium text-muted-foreground">
                    Sakit
                  </p>
                </div>
              </div>
              <p
                v-else
                class="py-6 text-center text-sm text-muted-foreground"
              >
                Belum ada data kehadiran hari ini.
              </p>
            </CardContent>
          </Card>

          <!-- Pending Admissions -->
          <Card
            class="shadow-none cursor-pointer transition-colors hover:bg-muted/30"
            @click="navigateTo('/admissions')"
          >
            <CardHeader class="border-b px-5 py-3.5">
              <div class="flex items-center gap-2">
                <FileText class="size-4 text-muted-foreground" />
                <CardTitle class="text-sm font-semibold">
                  Penerimaan Siswa Baru
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton class="h-10 w-20" />
                <Skeleton class="h-4 w-32" />
              </div>
              <div
                v-else
                class="flex items-end justify-between"
              >
                <div>
                  <p class="text-3xl font-bold tabular-nums">
                    {{ pendingAdmissions }}
                  </p>
                  <p class="mt-1 text-xs text-muted-foreground">
                    Pendaftar perlu ditinjau
                  </p>
                  <p class="text-[10px] text-muted-foreground">
                    (Terkirim, revisi, & terverifikasi)
                  </p>
                </div>
                <ChevronRight class="size-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <!-- Distributions & Events -->
        <div class="grid gap-6 lg:grid-cols-2">
          <Card class="shadow-none">
            <CardHeader class="border-b px-5 py-3.5">
              <div class="flex items-center gap-2">
                <BarChart3 class="size-4 text-muted-foreground" />
                <CardTitle class="text-sm font-semibold">
                  Distribusi Siswa per Tingkat
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton
                  v-for="i in 4"
                  :key="i"
                  class="h-10 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="distributions?.studentsByGrade?.length"
                class="space-y-2"
              >
                <div
                  v-for="item in distributions.studentsByGrade"
                  :key="item.grade"
                  class="flex items-center justify-between rounded-lg border px-4 py-2.5"
                >
                  <span class="text-sm font-medium">{{
                    formatGradeLevel(item.grade)
                  }}</span>
                  <div class="flex items-center gap-3">
                    <div class="h-2 w-24 overflow-hidden rounded-full bg-muted">
                      <div
                        class="h-full rounded-full bg-primary transition-all"
                        :style="{
                          width: `${Math.min(100, (item.totalStudents / Math.max(1, stats?.totalStudents ?? 1)) * 100)}%`,
                        }"
                      />
                    </div>
                    <span
                      class="min-w-[3ch] text-right text-sm font-semibold tabular-nums"
                    >
                      {{ item.totalStudents }}
                    </span>
                  </div>
                </div>
              </div>
              <p
                v-else
                class="py-6 text-center text-sm text-muted-foreground"
              >
                Belum ada data distribusi siswa.
              </p>
            </CardContent>
          </Card>

          <Card class="shadow-none">
            <CardHeader class="border-b px-5 py-3.5">
              <div class="flex items-center gap-2">
                <CalendarDays class="size-4 text-muted-foreground" />
                <CardTitle class="text-sm font-semibold">
                  Kegiatan Mendatang
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton
                  v-for="i in 4"
                  :key="i"
                  class="h-14 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="events.length"
                class="space-y-2"
              >
                <div
                  v-for="event in events"
                  :key="event.id"
                  class="flex items-start gap-3 rounded-lg border px-4 py-2.5"
                >
                  <div
                    class="flex flex-col items-center rounded-lg bg-muted px-2 py-1 text-center"
                  >
                    <span class="text-[10px] font-medium text-muted-foreground">
                      {{
                        new Date(event.startDate).toLocaleDateString('id-ID', {
                          month: 'short',
                        })
                      }}
                    </span>
                    <span class="text-base font-bold leading-tight">
                      {{ new Date(event.startDate).getDate() }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium break-words">
                      {{ event.title }}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {{ formatDate(event.startDate) }}
                      <template v-if="event.startDate !== event.endDate">
                        — {{ formatDate(event.endDate) }}
                      </template>
                    </p>
                  </div>
                  <Badge
                    :variant="eventTypeVariant(event.type)"
                    class="shrink-0"
                  >
                    {{ formatEventType(event.type) }}
                  </Badge>
                </div>
              </div>
              <p
                v-else
                class="py-6 text-center text-sm text-muted-foreground"
              >
                Tidak ada kegiatan mendatang.
              </p>
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <Card class="shadow-none">
            <CardHeader class="border-b px-5 py-3.5">
              <div class="flex items-center gap-2">
                <Users class="size-4 text-muted-foreground" />
                <CardTitle class="text-sm font-semibold">
                  Distribusi Pegawai per Jabatan
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton
                  v-for="i in 3"
                  :key="i"
                  class="h-10 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="distributions?.teachersByPosition?.length"
                class="space-y-2"
              >
                <div
                  v-for="item in distributions.teachersByPosition"
                  :key="item.category"
                  class="flex items-center justify-between rounded-lg border px-4 py-2.5"
                >
                  <span class="text-sm font-medium">{{
                    item.category ?? 'Tidak Berkategori'
                  }}</span>
                  <Badge
                    variant="secondary"
                    class="tabular-nums"
                  >
                    {{ item.total }}
                  </Badge>
                </div>
              </div>
              <p
                v-else
                class="py-6 text-center text-sm text-muted-foreground"
              >
                Belum ada data distribusi pegawai.
              </p>
            </CardContent>
          </Card>

          <Card class="shadow-none">
            <CardHeader class="border-b px-5 py-3.5">
              <div class="flex items-center gap-2">
                <Megaphone class="size-4 text-muted-foreground" />
                <CardTitle class="text-sm font-semibold">
                  Pengumuman Terbaru
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent class="p-5">
              <div
                v-if="loading"
                class="space-y-2"
              >
                <Skeleton
                  v-for="i in 3"
                  :key="i"
                  class="h-10 w-full rounded-lg"
                />
              </div>
              <div
                v-else-if="announcements.length"
                class="space-y-2"
              >
                <div
                  v-for="ann in announcements"
                  :key="ann.id"
                  class="flex flex-col gap-0.5 rounded-lg border px-4 py-2.5"
                >
                  <p class="text-sm font-medium break-words">
                    {{ ann.title }}
                  </p>
                  <span class="text-xs text-muted-foreground">{{
                    formatDate(ann.date)
                  }}</span>
                </div>
              </div>
              <p
                v-else
                class="py-6 text-center text-sm text-muted-foreground"
              >
                Belum ada pengumuman.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  </div>
</template>
