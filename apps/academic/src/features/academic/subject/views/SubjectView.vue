<script setup lang="ts">
import type { Subject, SubjectSavePayload } from '../types'
import SubjectFormSheet from '../components/SubjectFormSheet.vue'
import { createSubjectColumns } from '../components/columns'
import { useSubjectList } from '../composables/useSubjectList'
import { useSubjectDelete } from '../composables/useSubjectDelete'
import { useSubjectForm } from '../composables/useSubjectForm'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { Plus } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'

const breadcrumbs = [
  { title: 'Pembelajaran', href: '#' },
  { title: 'Mata Pelajaran', href: '/pembelajaran/mata-pelajaran' },
]

const { subjects, totalSubjects, loading, fetchSubjects } = useSubjectList()
const { deleteSubject } = useSubjectDelete()
const { isSaving, formError, saveSubject } = useSubjectForm()

const isAddModalOpen = ref(false)
const editingItem = ref<Subject | null>(null)
const { isAdmin } = useRoleGuard()

const tableColumns = createSubjectColumns({
  showActions: isAdmin.value,
  onEdit: (item: Subject) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: Subject, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteSubject(item.id)
    setLoading(false)
    if (result.success) {
      closeAlert()
    }
  },
})

async function handleSaveSubject(payload: SubjectSavePayload) {
  const result = await saveSubject(editingItem.value?.id ?? null, payload)
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

onMounted(() => {
  void fetchSubjects()
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
            Mata Pelajaran
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
          <DataTable
            :columns="tableColumns"
            :data="subjects"
            :total-items="totalSubjects"
            :is-loading="loading"
            item-label="mata pelajaran"
            filter-column="name"
            filter-placeholder="Cari mata pelajaran..."
          />

          <SubjectFormSheet
            v-if="isAdmin && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :form-error="formError"
            :is-saving="isSaving"
            :edit-data="editingItem"
            @save="handleSaveSubject"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
