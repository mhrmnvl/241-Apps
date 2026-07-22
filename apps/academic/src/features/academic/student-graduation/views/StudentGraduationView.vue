<script setup lang="ts">
import type { StudentGraduation, StudentGraduationSavePayload } from '../types'
import StudentGraduationFormDialog from '../components/StudentGraduationFormDialog.vue'
import { createStudentGraduationColumns } from '../components/columns'
import { useStudentGraduation } from '../composables/useStudentGraduation'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { Plus } from 'lucide-vue-next'
import { onMounted, ref, watch, computed } from 'vue'

const breadcrumbs = [
  { title: 'Data Master', href: '#' },
  { title: 'Daftar Alumni', href: '/alumni' },
]

const {
  items,
  totalItems,
  loading,
  isSaving,
  formError,
  academicYears,
  selectedAcademicYearId,
  fetchReferenceData,
  fetchStudentGraduations,
  saveStudentGraduation,
  deleteStudentGraduation,
} = useStudentGraduation()

const { isAdmin } = useRoleGuard()
const isAddModalOpen = ref(false)
const editingItem = ref<StudentGraduation | null>(null)

const academicYearFilterOptions = computed<ComboboxOption[]>(() => [
  { value: '', label: 'Semua Tahun Ajaran' },
  ...academicYears.value.map((ay) => ({
    value: ay.id,
    label: `${ay.name}${ay.isActive ? ' (Aktif)' : ''}`,
  })),
])

const tableColumns = createStudentGraduationColumns({
  showActions: isAdmin.value,
  onEdit: (item: StudentGraduation) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: StudentGraduation, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteStudentGraduation(item.id)
    if (result.success) {
      await fetchStudentGraduations()
      closeAlert()
    }
    setLoading(false)
  },
})

async function handleSave(payload: StudentGraduationSavePayload) {
  const result = await saveStudentGraduation(
    editingItem.value?.id ?? null,
    payload,
  )
  if (result.success) {
    isAddModalOpen.value = false
    await fetchStudentGraduations()
  }
}

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

watch(selectedAcademicYearId, () => {
  void fetchStudentGraduations()
})

onMounted(async () => {
  selectedAcademicYearId.value = ''
  await fetchReferenceData()
  void fetchStudentGraduations()
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
            Daftar Alumni
          </CardTitle>
          <Button
            v-if="isAdmin"
            @click="isAddModalOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6 space-y-4">
          <div class="rounded-lg border bg-muted/20 p-4">
            <div class="grid items-end gap-4 sm:grid-cols-1">
              <div class="grid gap-2 max-w-xs">
                <Label>Tahun Ajaran</Label>
                <AppCombobox
                  v-model="selectedAcademicYearId"
                  :options="academicYearFilterOptions"
                  placeholder="Semua Tahun Ajaran"
                  search-placeholder="Cari tahun ajaran..."
                  empty-text="Tahun ajaran tidak ditemukan."
                />
              </div>
            </div>
          </div>

          <DataTable
            :columns="tableColumns"
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="alumni"
            filter-column="studentName"
            filter-placeholder="Cari nama siswa..."
          />

          <StudentGraduationFormDialog
            v-if="isAdmin && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :edit-data="editingItem"
            :form-error="formError"
            :is-saving="isSaving"
            @save="handleSave"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
