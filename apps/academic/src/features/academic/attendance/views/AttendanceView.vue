<script setup lang="ts">
import AttendanceInputTable from '../components/AttendanceInputTable.vue'
import AttendanceSummaryCards from '../components/AttendanceSummaryCards.vue'
import AttendanceTrendChart from '../components/AttendanceTrendChart.vue'
import { createRecapColumns } from '../components/columns'
import { useAttendance } from '../composables/useAttendance'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable, DatePicker } from '@/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Filter } from 'lucide-vue-next'
import { onMounted, computed, ref, watch } from 'vue'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'

// Recording attendance (single or bulk create) requires attendances.manage —
// that's what the backend actually checks on POST /attendances[/bulk], not
// attendances.update (which only gates single-record PATCH, unused by this UI).
const { can } = useRoleGuard()
const canRecordAttendance = computed(() => can('attendances.manage'))

interface FilterOption {
  value: string
  label: string
}

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

const breadcrumbs = [
  { title: 'Penilaian', href: '#' },
  { title: 'Kehadiran Siswa', href: '/academic/attendance' },
]

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

const yearFilterOptions = computed<FilterOption[]>(() => {
  const current = new Date().getFullYear()
  const years = [current - 2, current - 1, current, current + 1]
  return years.map((y) => ({ value: String(y), label: String(y) }))
})

const recapColumns = createRecapColumns()

const isFilterDialogOpen = ref(false)

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
  isFilterDialogOpen.value = false
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
  <AppLayout :breadcrumbs="breadcrumbs">
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
            <Select v-model="selectedSemesterId">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Pilih Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="s in semesterFilterOptions"
                  :key="s.value"
                  :value="s.value"
                >
                  {{ s.label }}
                </SelectItem>
              </SelectContent>
            </Select>

            <Select v-model="selectedClassroomId">
              <SelectTrigger class="w-[140px]">
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

            <DatePicker
              v-if="activeTab === 'input'"
              v-model="selectedDate"
              class="w-[160px]"
            />
            <template v-else>
              <Select v-model="selectedMonthStr">
                <SelectTrigger class="w-[130px]">
                  <SelectValue placeholder="Pilih Bulan" />
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
                  <SelectValue placeholder="Pilih Tahun" />
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

          <!-- Mobile Filter Bar -->
          <div class="flex lg:hidden items-center gap-2 mb-6">
            <Button
              variant="outline"
              class="w-full relative justify-center"
              @click="isFilterDialogOpen = true"
            >
              <Filter class="size-4 mr-2" />
              Filter Kehadiran
            </Button>
          </div>

          <!-- Mobile Filter Dialog -->
          <Dialog v-model:open="isFilterDialogOpen">
            <DialogContent
              class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
            >
              <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
                <DialogTitle>Filter Kehadiran</DialogTitle>
                <DialogDescription class="sr-only">
                  Saring data kehadiran berdasarkan semester, kelas, tanggal,
                  bulan, atau tahun.
                </DialogDescription>
              </DialogHeader>

              <div class="p-6 space-y-4">
                <div class="grid gap-2">
                  <Label>Semester</Label>
                  <Select v-model="selectedSemesterId">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="s in semesterFilterOptions"
                        :key="s.value"
                        :value="s.value"
                      >
                        {{ s.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="grid gap-2">
                  <Label>Kelas</Label>
                  <Select v-model="selectedClassroomId">
                    <SelectTrigger>
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
                </div>
                <div
                  v-if="activeTab === 'input'"
                  class="grid gap-2"
                >
                  <Label>Tanggal</Label>
                  <DatePicker v-model="selectedDate" />
                </div>
                <template v-else>
                  <div class="grid gap-2">
                    <Label>Bulan</Label>
                    <Select v-model="selectedMonthStr">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Bulan" />
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
                  </div>
                  <div class="grid gap-2">
                    <Label>Tahun</Label>
                    <Select v-model="selectedYearStr">
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Tahun" />
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
                </template>
              </div>

              <DialogFooter
                class="p-6 border-t bg-muted/10 flex items-center justify-end gap-2 shrink-0"
              >
                <Button
                  class="w-full"
                  @click="isFilterDialogOpen = false"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
              class="mt-4 space-y-6"
            >
              <AttendanceSummaryCards
                :recap-items="recapItems"
                :class-percentage="classPercentage"
                :month-delta="monthDelta"
                :loading="recapLoading"
              />
              <AttendanceTrendChart :trend-data="trendData" />
              <DataTable
                :columns="recapColumns"
                :data="recapItems"
                :total-items="recapItems.length"
                :is-loading="recapLoading"
                item-label="siswa"
                filter-column="studentName"
                filter-placeholder="Cari nama siswa..."
              />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
