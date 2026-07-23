<script setup lang="ts">
import type { Subject, SubjectSavePayload } from '../types'
import SubjectFormDialog from '../components/SubjectFormDialog.vue'
import { createSubjectColumns } from '../components/columns'
import { useSubjectList } from '../composables/useSubjectList'
import { useSubjectDelete } from '../composables/useSubjectDelete'
import { useSubjectForm } from '../composables/useSubjectForm'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { useRoleGuard } from '@/features/platform/auth'
import { Plus, Search } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Input } from '@/ui/input'

const breadcrumbs = [
  { title: 'Pembelajaran', href: '#' },
  { title: 'Mata Pelajaran', href: '/learning/subject' },
]

const { subjects, totalSubjects, loading, currentFilters, fetchSubjects } =
  useSubjectList()
const searchKeyword = ref(currentFilters.value.search ?? '')

watchDebounced(
  searchKeyword,
  (val) => {
    void fetchSubjects({
      search: val.trim() || '',
      page: 1,
    })
  },
  { debounce: 500 },
)
const { deleteSubject } = useSubjectDelete()
const { isSaving, formError, saveSubject } = useSubjectForm()

const isAddModalOpen = ref(false)
const editingItem = ref<Subject | null>(null)
const { can } = useRoleGuard()

const tableColumns = createSubjectColumns({
  showActions: can('subjects.update') || can('subjects.delete'),
  canUpdate: can('subjects.update'),
  canDelete: can('subjects.delete'),
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
            v-if="can('subjects.create')"
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
            :page="currentFilters.page"
            :is-loading="loading"
            item-label="mata pelajaran"
            @update:page="(page) => fetchSubjects({ page })"
            @update:page-size="(limit) => fetchSubjects({ limit, page: 1 })"
          >
            <template #header-right>
              <div class="relative w-full sm:w-48 max-w-[200px]">
                <Search
                  class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground"
                />
                <Input
                  v-model="searchKeyword"
                  placeholder="Cari mata pelajaran..."
                  class="h-8 pl-8 w-full text-xs"
                />
              </div>
            </template>
          </DataTable>

          <SubjectFormDialog
            v-if="can('subjects.create') && isAddModalOpen"
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
