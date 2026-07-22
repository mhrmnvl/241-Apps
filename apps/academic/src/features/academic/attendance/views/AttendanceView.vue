<script setup lang="ts">
import AttendanceInputTable from '../components/AttendanceInputTable.vue'
import { createRecapColumns } from '../components/columns'
import { useAttendance } from '../composables/useAttendance'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import { Input } from '@/ui/input'
import { Search } from 'lucide-vue-next'
import { onMounted, computed } from 'vue'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'

const { can } = useRoleGuard()
const canRecordAttendance = computed(() => can('attendances.update'))

const breadcrumbs = [
  { title: 'Penilaian', href: '#' },
  { title: 'Kehadiran Siswa', href: '/akademik/kehadiran' },
]

const {
  loading,
  isSaving,
  classrooms,
  semesters,
  selectedClassroomId,
  selectedSemesterId,
  selectedDate,
  inputRows,
  recapItems,
  recapLoading,
  activeTab,
  fetchFilterOptions,
  loadAttendanceInput,
  bulkSaveAttendance,
  fetchRecap,
} = useAttendance()

const semesterFilterOptions = computed<ComboboxOption[]>(() =>
  semesters.value.map((s) => ({
    value: s.id,
    label:
      `${s.type?.name === 'ODD' ? 'Ganjil' : 'Genap'} ${s.academicYear?.name ?? ''}`.trim(),
  })),
)

const classroomFilterOptions = computed<ComboboxOption[]>(() =>
  classrooms.value.map((c) => ({
    value: c.id,
    label: c.code ?? '-',
  })),
)

const recapColumns = createRecapColumns()

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
          <div class="rounded-lg border bg-muted/20 p-4">
            <div
              class="grid items-end gap-4"
              :class="
                activeTab === 'input'
                  ? 'lg:grid-cols-[1fr_1fr_1fr_auto]'
                  : 'sm:grid-cols-[1fr_1fr_auto]'
              "
            >
              <div class="grid gap-2">
                <Label>Semester</Label>
                <AppCombobox
                  v-model="selectedSemesterId"
                  :options="semesterFilterOptions"
                  placeholder="Pilih Semester"
                  search-placeholder="Cari semester..."
                  empty-text="Semester tidak ditemukan."
                />
              </div>
              <div class="grid gap-2">
                <Label>Kelas</Label>
                <AppCombobox
                  v-model="selectedClassroomId"
                  :options="classroomFilterOptions"
                  placeholder="Pilih Kelas"
                  search-placeholder="Cari kelas..."
                  empty-text="Kelas tidak ditemukan."
                />
              </div>
              <div
                v-if="activeTab === 'input'"
                class="grid gap-2"
              >
                <Label>Tanggal</Label>
                <Input
                  v-model="selectedDate"
                  type="date"
                />
              </div>
              <Button
                :disabled="!isFilterReady || loading || recapLoading"
                @click="handleFilter"
              >
                <Search class="size-4 mr-2" />
                Tampilkan
              </Button>
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
