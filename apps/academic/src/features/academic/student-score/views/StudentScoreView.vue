<script setup lang="ts">
import StudentScoreFormSheet from '../components/StudentScoreFormSheet.vue'
import AssessmentItemDialog from '../components/AssessmentItemDialog.vue'
import { useStudentScore } from '../composables/useStudentScore'
import { createstudentScoreColumns } from './columns'
import type { StudentScoreRow } from '../types'
import type { StudentScoreSavePayload } from '../types'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Search, Settings2 } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'

const semesterFilterOptions = computed<ComboboxOption[]>(() =>
  semesters.value.map((s) => ({
    value: s.id,
    label: `${s.academicYear?.name ?? ''} - ${s.type.name} (${s.isActive ? 'Aktif' : 'Tidak Aktif'})`,
  })),
)
const classroomFilterOptions = computed<ComboboxOption[]>(() =>
  classrooms.value.map((c) => ({
    value: c.id,
    label: c.name ?? c.classroomLevel?.name ?? '-',
  })),
)
const subjectFilterOptions = computed<ComboboxOption[]>(() =>
  subjects.value.map((s) => ({
    value: s.id,
    label: `${s.name} (Kelas ${s.gradeLevel ?? '-'})`,
  })),
)
import { useRoleGuard } from '@/shared/composables/useRoleGuard'

const breadcrumbs = [
  { title: 'Manajemen Nilai', href: '#' },
  { title: 'Nilai Siswa', href: '/student-scores' },
]

const {
  items,
  totalItems,
  loading,
  isSaving,
  formError,
  classrooms,
  subjects,
  semesters,
  selectedClassroomId,
  selectedSubjectId,
  selectedSemesterId,
  teachingAssignment,
  assessmentItems,
  fetchRelatedData,
  fetchAll,
  saveScores,
} = useStudentScore()

const openForm = ref(false)
const openAssessmentDialog = ref(false)
const editingData = ref<StudentScoreRow | null>(null)
const isFilterReady = computed(() =>
  Boolean(selectedClassroomId.value && selectedSubjectId.value),
)
const hasDisplayedData = ref(items.value.length > 0)
const { isAdmin, canContribute } = useRoleGuard()

const columns = computed(() => {
  const cols = createstudentScoreColumns(
    {
      onEdit: (item) => {
        editingData.value = item
        openForm.value = true
      },
    },
    assessmentItems.value,
  )
  if (!canContribute.value) {
    return cols.filter((c) => c.id !== 'actions')
  }
  return cols
})

async function handleFilter() {
  if (!isFilterReady.value) return
  hasDisplayedData.value = true
  await fetchAll()
}

async function handleSave(
  scoresToSave: StudentScoreSavePayload[],
  scoresToUpdate: { id: string; payload: Partial<StudentScoreSavePayload> }[],
) {
  const result = await saveScores(scoresToSave, scoresToUpdate)
  if (result.success) {
    openForm.value = false
    await fetchAll()
    toast.success('Nilai siswa berhasil disimpan.')
  }
}

watch(openForm, (isOpen) => {
  if (!isOpen) {
    editingData.value = null
    formError.value = null
  }
})

watch([selectedClassroomId, selectedSubjectId, selectedSemesterId], () => {
  hasDisplayedData.value = false
})

onMounted(async () => {
  await fetchRelatedData()
  selectedSemesterId.value ??=
    semesters.value.find((semester) => semester.isActive)?.id ?? null
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col items-start justify-between gap-2 border-b px-6 py-5 sm:flex-row sm:items-center"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Nilai Siswa
            </CardTitle>
          </div>
        </CardHeader>

        <div class="space-y-6 p-6">
          <div class="rounded-lg border bg-muted/20 p-4">
            <div
              class="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
            >
              <div class="grid gap-2">
                <Label>Tahun Ajaran / Semester</Label>
                <AppCombobox
                  v-model="selectedSemesterId"
                  :options="semesterFilterOptions"
                  placeholder="Pilih semester"
                  search-placeholder="Cari semester..."
                  empty-text="Semester tidak ditemukan."
                />
              </div>

              <div class="grid gap-2">
                <Label>Kelas <span class="text-destructive">*</span></Label>
                <AppCombobox
                  v-model="selectedClassroomId"
                  :options="classroomFilterOptions"
                  placeholder="Pilih kelas"
                  search-placeholder="Cari kelas..."
                  empty-text="Kelas tidak ditemukan."
                />
              </div>

              <div class="grid gap-2">
                <Label
                  >Mata Pelajaran <span class="text-destructive">*</span></Label
                >
                <AppCombobox
                  v-model="selectedSubjectId"
                  :options="subjectFilterOptions"
                  placeholder="Pilih mata pelajaran"
                  search-placeholder="Cari mata pelajaran..."
                  empty-text="Mata pelajaran tidak ditemukan."
                />
              </div>

              <Button
                :disabled="!isFilterReady || loading"
                class="w-full lg:w-auto"
                @click="handleFilter"
              >
                <Search class="size-4 mr-2" />
                Tampilkan
              </Button>
            </div>
          </div>

          <div
            v-if="hasDisplayedData && teachingAssignment && isAdmin"
            class="flex justify-end"
          >
            <Button
              variant="outline"
              @click="openAssessmentDialog = true"
            >
              <Settings2 class="size-4 mr-2" />
              Kelola Komponen Penilaian
            </Button>
          </div>

          <DataTable
            v-if="hasDisplayedData"
            :columns="columns"
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="siswa"
            filter-column="studentName"
            filter-placeholder="Cari nama siswa..."
          />

          <div
            v-else
            class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 px-6 py-16 text-center"
          >
            <h3 class="text-lg font-semibold text-foreground">
              {{
                isFilterReady ? 'Data Siap Ditampilkan' : 'Pilih Konteks Nilai'
              }}
            </h3>
            <p class="mt-2 max-w-sm text-sm text-muted-foreground">
              {{
                isFilterReady
                  ? 'Klik Tampilkan untuk memuat daftar siswa sesuai konteks yang dipilih.'
                  : 'Pilih kelas dan mata pelajaran terlebih dahulu untuk mulai mengelola nilai siswa.'
              }}
            </p>
          </div>

          <StudentScoreFormSheet
            v-if="isAdmin && openForm"
            v-model:open="openForm"
            :edit-data="editingData"
            :form-error="formError"
            :is-saving="isSaving"
            @save="handleSave"
          />

          <AssessmentItemDialog
            v-if="isAdmin"
            v-model:open="openAssessmentDialog"
            @changed="handleFilter"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
