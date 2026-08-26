<script setup lang="ts">
import type {
  TeachingAssignment,
  TeachingAssignmentCreatePayload,
  TeachingAssignmentUpdatePayload,
} from '../types'
import TeachingAssignmentFormDialog from '../components/TeachingAssignmentFormDialog.vue'
import { createTeachingAssignmentColumns } from '../components/columns'
import { useTeachingAssignment } from '../composables/useTeachingAssignment'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { useRoleGuard } from '@/features/platform/auth'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { EVERY_CLASSROOM } from '../constants/filters'

const {
  items,
  totalItems,
  currentPage,
  pageSize,
  loading,
  isSaving,
  formError,
  classrooms,
  selectedClassroomId,
  fetchFilterOptions,
  fetchTeachingAssignments,
  saveTeachingAssignment,
  deleteTeachingAssignment,
  setPage,
  setPageSize,
} = useTeachingAssignment()

const isAddModalOpen = ref(false)
const editingItem = ref<TeachingAssignment | null>(null)
const { can } = useRoleGuard()

const classroomFilterOptions = computed(() => [
  { value: EVERY_CLASSROOM, label: 'Semua Kelas' },
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
  payload: TeachingAssignmentCreatePayload | TeachingAssignmentUpdatePayload,
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

watch(selectedClassroomId, () => {
  currentPage.value = 1
  void fetchTeachingAssignments()
})

onMounted(async () => {
  // Defaults to every class. The sentinel exists because the select rejects an
  // empty-string item value; the service is what keeps it off the wire.
  if (!selectedClassroomId.value) {
    selectedClassroomId.value = EVERY_CLASSROOM
  }
  await fetchFilterOptions()
  await fetchTeachingAssignments()
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
        <DataTable
          :columns="tableColumns"
          :data="items"
          :is-loading="loading"
          :total-items="totalItems"
          :page="currentPage"
          :page-size="pageSize"
          item-label="penugasan mengajar"
          filter-column="teacher"
          filter-placeholder="Cari guru..."
          @update:page="setPage"
          @update:page-size="setPageSize"
        >
          <template #header-right>
            <Select v-model="selectedClassroomId">
              <SelectTrigger class="h-8 w-[160px] text-xs">
                <SelectValue placeholder="Semua Kelas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="opt in classroomFilterOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </DataTable>

        <TeachingAssignmentFormDialog
          v-if="isAddModalOpen"
          v-model:open="isAddModalOpen"
          :form-error="formError"
          :is-saving="isSaving"
          :edit-data="editingItem"
          @save="handleSaveTeachingAssignment"
        />
      </div>
    </Card>
  </div>
</template>
