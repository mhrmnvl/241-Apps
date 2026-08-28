<script setup lang="ts">
import type { FilterOption } from '@/shared/types/filter.types'
import AttendanceRecapTab from '../components/AttendanceRecapTab.vue'
import { useAttendance } from '../composables/useAttendance'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { onMounted, computed, watch } from 'vue'

const MONTH_OPTIONS: FilterOption[] = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
].map((label, i) => ({ value: String(i + 1), label }))

const {
  classrooms,
  semesters,
  selectedClassroomId,
  selectedSemesterId,
  selectedMonth,
  selectedYear,
  recapItems,
  recapLoading,
  trendData,
  classPercentage,
  monthDelta,
  fetchFilterOptions,
  fetchRecap,
} = useAttendance()

const activeSemester = computed(
  () => semesters.value.find((s) => s.id === selectedSemesterId.value) ?? null,
)

const academicYearLabel = computed(
  () => activeSemester.value?.academicYear?.name ?? null,
)

const semesterLabel = computed(() => {
  const name = activeSemester.value?.type?.name
  if (name === 'ODD') return 'Ganjil'
  if (name === 'EVEN') return 'Genap'
  return name ?? null
})

const classroomFilterOptions = computed<FilterOption[]>(() =>
  classrooms.value.map((c) => ({
    value: c.id,
    label: c.code ?? '-',
  })),
)

const yearFilterOptions = computed<FilterOption[]>(() => {
  const current = new Date().getFullYear()
  const years = [current - 2, current - 1, current, current + 1]
  return years.map((y) => ({ value: String(y), label: String(y) }))
})

const selectedMonthStr = computed({
  get: () => String(selectedMonth.value),
  set: (val: string) => {
    selectedMonth.value = Number(val)
  },
})

const selectedYearStr = computed({
  get: () => String(selectedYear.value),
  set: (val: string) => {
    selectedYear.value = Number(val)
  },
})

const isFilterReady = computed(() =>
  Boolean(selectedClassroomId.value && selectedSemesterId.value),
)

watch(
  [selectedSemesterId, selectedClassroomId, selectedMonth, selectedYear],
  () => {
    if (isFilterReady.value) {
      void fetchRecap()
    }
  },
)

onMounted(async () => {
  await fetchFilterOptions()
  const activeSemester = semesters.value.find((s) => s.isActive)
  if (activeSemester) {
    selectedSemesterId.value = activeSemester.id
  }
  if (!selectedClassroomId.value && classrooms.value.length > 0) {
    selectedClassroomId.value = classrooms.value[0].id
  }
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
        <CardTitle class="text-2xl font-bold tracking-tight">
          Rekapitulasi Kehadiran
        </CardTitle>
      </CardHeader>

      <div class="space-y-6 p-6">
        <!-- Desktop: horizontal row with academic info badges + selects (same as Tugas) -->
        <div class="hidden lg:flex lg:flex-row lg:items-center gap-3">
          <template v-if="academicYearLabel">
            <div
              class="flex items-center gap-2 rounded-md border bg-muted/30 px-3 h-9 text-sm"
            >
              <span class="text-muted-foreground">Tahun Ajaran</span>
              <span class="font-semibold">{{ academicYearLabel }}</span>
            </div>
            <div
              class="flex items-center gap-2 rounded-md border bg-muted/30 px-3 h-9 text-sm"
            >
              <span class="text-muted-foreground">Semester</span>
              <span class="font-semibold">{{ semesterLabel }}</span>
            </div>
          </template>
          <div
            v-else
            class="flex items-center rounded-md border border-destructive/40 bg-destructive/5 px-3 h-9 text-sm text-destructive"
          >
            Belum ada semester aktif
          </div>

          <Select v-model="selectedClassroomId">
            <SelectTrigger class="w-[120px]">
              <SelectValue placeholder="Pilih Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="c in classroomFilterOptions"
                :key="c.value"
                :value="c.value"
              >
                {{ c.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="selectedMonthStr">
            <SelectTrigger class="w-[130px]">
              <SelectValue placeholder="Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="m in MONTH_OPTIONS"
                :key="m.value"
                :value="m.value"
              >
                {{ m.label }}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select v-model="selectedYearStr">
            <SelectTrigger class="w-[110px]">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="y in yearFilterOptions"
                :key="y.value"
                :value="y.value"
              >
                {{ y.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Mobile: academic info badges + inline selects -->
        <div class="flex lg:hidden flex-col gap-3">
          <div
            v-if="academicYearLabel"
            class="flex items-center justify-center gap-2"
          >
            <div
              class="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 h-8 text-xs"
            >
              <span class="text-muted-foreground">Tahun Ajaran</span>
              <span class="font-semibold">{{ academicYearLabel }}</span>
            </div>
            <div
              class="flex items-center gap-1.5 rounded-md border bg-muted/30 px-2.5 h-8 text-xs"
            >
              <span class="text-muted-foreground">Semester</span>
              <span class="font-semibold">{{ semesterLabel }}</span>
            </div>
          </div>
          <div
            v-else
            class="flex items-center rounded-md border border-destructive/40 bg-destructive/5 px-2.5 h-8 text-xs text-destructive"
          >
            Belum ada semester aktif
          </div>

          <div class="grid grid-cols-3 gap-2">
            <Select v-model="selectedClassroomId">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="c in classroomFilterOptions"
                  :key="c.value"
                  :value="c.value"
                >
                  {{ c.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedMonthStr">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="m in MONTH_OPTIONS"
                  :key="m.value"
                  :value="m.value"
                >
                  {{ m.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedYearStr">
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="y in yearFilterOptions"
                  :key="y.value"
                  :value="y.value"
                >
                  {{ y.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Waiting / Empty State -->
        <Card
          v-if="!isFilterReady"
          class="shadow-none"
        >
          <CardContent class="py-10 text-center text-sm text-muted-foreground">
            {{
              !selectedSemesterId
                ? 'Belum ada semester aktif. Aktifkan satu lewat menu Periode Akademik.'
                : 'Pilih kelas untuk menampilkan rekapitulasi kehadiran.'
            }}
          </CardContent>
        </Card>

        <!-- Recap Content -->
        <AttendanceRecapTab
          v-else
          :recap-items="recapItems"
          :class-percentage="classPercentage"
          :month-delta="monthDelta"
          :recap-loading="recapLoading"
          :trend-data="trendData"
        />
      </div>
    </Card>
  </div>
</template>
