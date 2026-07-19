<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus } from 'lucide-vue-next'
import { useStudentParent } from '../composables/useStudentParent'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { createStudentParentColumns } from '../components/columns'
import StudentParentFormSheet from '../components/StudentParentFormSheet.vue'
import type { StudentParent, StudentParentFormPayload } from '../types'

const breadcrumbs = [
  { title: 'Data Master', href: '#' },
  { title: 'Relasi Orang Tua', href: '/data-master/relasi-orang-tua' },
]

const {
  items,
  totalItems,
  loading,
  isSaving,
  formError,
  students,
  parents,
  fetchAll,
  save,
  deleteStudentParent,
  fetchStudents,
  fetchParents,
} = useStudentParent()

const isFormOpen = ref(false)
const editingItem = ref<StudentParent | null>(null)
const { isAdmin } = useRoleGuard()

const columns = createStudentParentColumns({
  onEdit: (item: StudentParent) => {
    editingItem.value = item
    isFormOpen.value = true
  },
  onDelete: (item: StudentParent, { setLoading, closeAlert }) => {
    setLoading(true)
    void deleteStudentParent(item.id)
      .then((result) => {
        if (result.success) {
          closeAlert()
          void fetchAll()
        }
      })
      .finally(() => {
        setLoading(false)
      })
  },
})

async function handleSave(payload: StudentParentFormPayload) {
  const result = await save(editingItem.value?.id ?? null, payload)
  if (result.success) {
    isFormOpen.value = false
    await fetchAll()
  }
}

watch(isFormOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchParents()])
  await fetchAll()
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
            Relasi Siswa — Orang Tua
          </CardTitle>
          <Button
            v-if="isAdmin"
            @click="isFormOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="relasi"
          />

          <StudentParentFormSheet
            v-if="isAdmin && isFormOpen"
            v-model:open="isFormOpen"
            :edit-data="editingItem"
            :form-error="formError"
            :is-saving="isSaving"
            :students="students"
            :parents="parents"
            @save="handleSave"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
