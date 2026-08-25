<script setup lang="ts">
import type { FilterOption } from '@/shared/types/filter.types'
import AttendanceInputTable from '../components/AttendanceInputTable.vue'
import AttendanceRecapTab from '../components/AttendanceRecapTab.vue'
import { useAttendance } from '../composables/useAttendance'
import { toDateInputValue } from '@/shared/utils/utils'
import { DatePicker } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { onMounted, computed, watch } from 'vue'
import { useRoleGuard } from '@/features/platform/auth'

const { can } = useRoleGuard()
const canRecordAttendance = computed(() => can('attendances.manage'))

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
  loading,
  isSaving,
  classrooms,
  semesters,
  selectedClassroomId,
  selectedSemesterId,
  selectedDate,
  selectedMonth,
  selectedYear,
  inputRows,
  recapItems,
  recapLoading,
  trendData,
  classPercentage,
  monthDelta,
  activeTab,
  fetchFilterOptions,
  loadAttendanceInput,
  bulkSaveAttendance,
  fetchRecap,
} = useAttendance()

// ── Semester badge info (same pattern as Tugas) ──────────────────────
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

const isFilterReady = computed(() => {
  if (activeTab.value === 'input') {
    return Boolean(
      selectedClassroomId.value &&
      selectedSemesterId.value &&
      selectedDate.value,
    )
  }
  return Boolean(selectedClassroomId.value && selectedSemesterId.value)
})

function handleFilter() {
  if (activeTab.value === 'input') {
    void loadAttendanceInput()
  } else {
    void fetchRecap()
  }
}

async function handleBulkSave() {
  await bulkSaveAttendance()
}

watch(
  [
    selectedSemesterId,
    selectedClassroomId,
    selectedDate,
    selectedMonth,
    selectedYear,
    activeTab,
  ],
  () => {
    if (isFilterReady.value) {
      handleFilter()
    }
  },
)

onMounted(async () => {
  if (!canRecordAttendance.value) {
    activeTab.value = 'recap'
  }
  await fetchFilterOptions()
  const activeSem = semesters.value.find((s) => s.isActive)
  if (activeSem) {
    selectedSemesterId.value = activeSem.id
  }
  selectedDate.value = toDateInputValue()
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
          Kehadiran Siswa
        </CardTitle>
      </CardHeader>

      <div class="p-6 space-y-6">
        <!-- Desktop Filter Bar -->
        <div class="hidden lg:flex lg:flex-row lg:items-center gap-3 mb-6">
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
            <SelectTrigger class="w-[92px]">
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

          <DatePicker
            v-if="activeTab === 'input'"
            v-model="selectedDate"
            class="w-[160px]"
          />
          <template v-else>
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
          </template>
        </div>

        <!-- Mobile: academic info + inline selects -->
        <div class="flex lg:hidden flex-col gap-3 mb-6">
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
            class="flex items-center justify-center rounded-md border border-destructive/40 bg-destructive/5 px-2.5 h-8 text-xs text-destructive"
          >
            Belum ada semester aktif
          </div>

          <div class="flex justify-center gap-2">
            <Select v-model="selectedClassroomId">
              <SelectTrigger class="min-w-0">
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

            <DatePicker
              v-if="activeTab === 'input'"
              v-model="selectedDate"
              class="min-w-0"
            />
            <template v-else>
              <Select v-model="selectedMonthStr">
                <SelectTrigger class="min-w-0">
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
                <SelectTrigger class="min-w-0">
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
            </template>
          </div>
        </div>

        <Tabs
          v-model="activeTab"
          class="w-full"
        >
          <TabsList>
            <TabsTrigger
              v-if="canRecordAttendance"
              value="input"
            >
              Input Kehadiran
            </TabsTrigger>
            <TabsTrigger value="recap">Rekapitulasi</TabsTrigger>
          </TabsList>

          <TabsContent
            value="input"
            class="mt-4"
          >
            <AttendanceInputTable
              v-model:rows="inputRows"
              :loading="loading"
              :is-saving="isSaving"
              @save="handleBulkSave"
            />
          </TabsContent>

          <TabsContent
            value="recap"
            class="mt-4"
          >
            <AttendanceRecapTab
              :recap-items="recapItems"
              :class-percentage="classPercentage"
              :month-delta="monthDelta"
              :recap-loading="recapLoading"
              :trend-data="trendData"
            />
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  </div>
</template>
