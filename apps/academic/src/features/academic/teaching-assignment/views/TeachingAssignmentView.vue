<script setup lang="ts">
import type {
  TeachingAssignment,
  TeachingAssignmentSavePayload,
} from '../types'
import TeachingAssignmentFormDialog from '../components/TeachingAssignmentFormDialog.vue'
import { createTeachingAssignmentColumns } from '../components/columns'
import { useTeachingAssignment } from '../composables/useTeachingAssignment'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'

const breadcrumbs = [
  { title: 'Pembelajaran', href: '#' },
  { title: 'Penugasan Mengajar', href: '/pembelajaran/penugasan-mengajar' },
]

const {
  items,
  totalItems,
  loading,
  isSaving,
  formError,
  classrooms,
  semesters,
  selectedSemesterId,
  selectedClassroomId,
  fetchFilterOptions,
  fetchTeachingAssignments,
  saveTeachingAssignment,
  deleteTeachingAssignment,
} = useTeachingAssignment()

const isAddModalOpen = ref(false)
const editingItem = ref<TeachingAssignment | null>(null)
const { can } = useRoleGuard()

const semesterFilterOptions = computed<ComboboxOption[]>(() => [
  { value: '', label: 'Semua Semester' },
  ...semesters.value.map((s) => ({
    value: s.id,
    label:
      `${s.type?.name === 'ODD' ? 'Ganjil' : 'Genap'} ${s.academicYear?.name ?? ''}`.trim(),
  })),
])

const classroomFilterOptions = computed<ComboboxOption[]>(() => [
  { value: '', label: 'Semua Kelas' },
  ...classrooms.value.map((c) => ({
    value: c.id,
    label: c.code ?? '-',
  })),
])

const tableColumns = createTeachingAssignmentColumns({
  showActions:
    can('teaching-assignments.update') || can('teaching-assignments.delete'),
  canUpdate: can('teaching-assignments.update'),
  canDelete: can('teaching-assignments.delete'),
  onEdit: (item: TeachingAssignment) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: TeachingAssignment, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteTeachingAssignment(item.id)
    setLoading(false)
    if (result.success) {
      closeAlert()
    }
  },
})

async function handleSaveTeachingAssignment(
  payload: TeachingAssignmentSavePayload,
) {
  const result = await saveTeachingAssignment(
    editingItem.value?.id ?? null,
    payload,
  )
  if (result.success) {
    isAddModalOpen.value = false
  }
}

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

watch([selectedSemesterId, selectedClassroomId], () => {
  void fetchTeachingAssignments()
})

onMounted(async () => {
  await fetchFilterOptions()
  await fetchTeachingAssignments()
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
            Penugasan Mengajar
          </CardTitle>
          <Button
            v-if="can('teaching-assignments.create')"
            @click="isAddModalOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6 space-y-6">
          <div class="rounded-lg border bg-muted/20 p-4">
            <div class="grid items-end gap-4 sm:grid-cols-2">
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
            </div>
          </div>

          <DataTable
            :columns="tableColumns"
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="penugasan mengajar"
            filter-column="teacher"
            filter-placeholder="Cari guru..."
          />

          <TeachingAssignmentFormDialog
            v-if="can('teaching-assignments.create') && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :form-error="formError"
            :is-saving="isSaving"
            :edit-data="editingItem"
            @save="handleSaveTeachingAssignment"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
