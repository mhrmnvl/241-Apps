<script setup lang="ts">
import type { FilterOption } from '@/shared/types/filter.types'
import AttendanceFilterBar from '../components/AttendanceFilterBar.vue'
import AttendanceInputTable from '../components/AttendanceInputTable.vue'
import AttendanceRecapTab from '../components/AttendanceRecapTab.vue'
import { useAttendance } from '../composables/useAttendance'
import { Card, CardHeader, CardTitle } from '@/ui/card'
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

const semesterFilterOptions = computed<FilterOption[]>(() =>
  semesters.value.map((s) => ({
    value: s.id,
    label:
      `${s.type?.name === 'ODD' ? 'Ganjil' : 'Genap'} ${s.academicYear?.name ?? ''}`.trim(),
  })),
)

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
  const activeSemester = semesters.value.find((s) => s.isActive)
  if (activeSemester) {
    selectedSemesterId.value = activeSemester.id
  }
  const today = new Date()
  selectedDate.value = today.toISOString().split('T')[0] ?? ''
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
        <AttendanceFilterBar
          v-model:selected-semester-id="selectedSemesterId"
          v-model:selected-classroom-id="selectedClassroomId"
          v-model:selected-date="selectedDate"
          v-model:selected-month="selectedMonth"
          v-model:selected-year="selectedYear"
          :active-tab="activeTab"
          :semester-filter-options="semesterFilterOptions"
          :classroom-filter-options="classroomFilterOptions"
          :month-options="MONTH_OPTIONS"
          :year-filter-options="yearFilterOptions"
        />

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
