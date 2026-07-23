<script setup lang="ts">
import type { CurriculumSubject, CurriculumSubjectSavePayload } from '../types'
import CurriculumSubjectFormDialog from '../components/CurriculumSubjectFormDialog.vue'
import AddCurriculumSubjectDialog from '../components/AddCurriculumSubjectDialog.vue'
import { createCurriculumSubjectColumns } from '../components/columns'
import { useCurriculumSubject } from '../composables/useCurriculumSubject'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/ui/card'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { ArrowLeft, Plus } from 'lucide-vue-next'
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const curriculumId = route.params.id as string

const {
  items,
  totalItems,
  loading,
  isSaving,
  formError,
  curriculumName,
  curriculumAcademicYear,
  subjects,
  fetchReferenceData,
  fetchCurriculumSubjects,
  fetchCurriculumInfo,
  saveCurriculumSubject,
  bulkCreateCurriculumSubjects,
  deleteCurriculumSubject,
} = useCurriculumSubject()

const breadcrumbs = computed(() => [
  { title: 'Akademik', href: '#' },
  { title: 'Kurikulum', href: '/academic/curriculum' },
  { title: curriculumName.value || 'Detail', href: route.path },
])

const isAddDialogOpen = ref(false)
const isEditSheetOpen = ref(false)
const editingItem = ref<CurriculumSubject | null>(null)
const { can } = useRoleGuard()

const existingSubjectIds = computed(() =>
  items.value.map((item) => item.subjectId),
)

const tableColumns = createCurriculumSubjectColumns({
  showActions:
    can('curriculum-subjects.update') || can('curriculum-subjects.delete'),
  canUpdate: can('curriculum-subjects.update'),
  canDelete: can('curriculum-subjects.delete'),
  onEdit: (item: CurriculumSubject) => {
    editingItem.value = item
    isEditSheetOpen.value = true
  },
  onDelete: async (item: CurriculumSubject, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteCurriculumSubject(item.id)
    setLoading(false)
    if (result.success) {
      closeAlert()
      void fetchCurriculumSubjects(curriculumId)
    }
  },
})

async function handleSaveCurriculumSubject(
  payload: CurriculumSubjectSavePayload,
) {
  const result = await saveCurriculumSubject(
    editingItem.value?.id ?? null,
    payload,
  )
  if (result.success) {
    isEditSheetOpen.value = false
    void fetchCurriculumSubjects(curriculumId)
  }
}

async function handleBulkSave(subjectIds: string[]) {
  const result = await bulkCreateCurriculumSubjects(curriculumId, subjectIds)
  if (result.success) {
    isAddDialogOpen.value = false
    void fetchCurriculumSubjects(curriculumId)
  }
}

watch(isEditSheetOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

onMounted(async () => {
  await Promise.all([
    fetchReferenceData(),
    fetchCurriculumInfo(curriculumId),
    fetchCurriculumSubjects(curriculumId),
  ])
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
          <div class="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              class="size-8"
              @click="router.push('/academic/curriculum')"
            >
              <ArrowLeft class="size-4" />
            </Button>
            <div class="grid gap-0.5">
              <CardTitle class="text-2xl font-bold tracking-tight">
                Mata Pelajaran Kurikulum
              </CardTitle>
              <CardDescription v-if="curriculumName">
                Kurikulum: {{ curriculumName }} ({{ curriculumAcademicYear }})
              </CardDescription>
            </div>
          </div>
          <Button
            v-if="can('curriculum-subjects.create')"
            @click="isAddDialogOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6 space-y-6">
          <DataTable
            :columns="tableColumns"
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="mata pelajaran kurikulum"
            filter-column="subject"
            filter-placeholder="Cari mata pelajaran..."
          />

          <CurriculumSubjectFormDialog
            v-if="can('curriculum-subjects.update') && isEditSheetOpen"
            v-model:open="isEditSheetOpen"
            :form-error="formError"
            :is-saving="isSaving"
            :curriculum-id="curriculumId"
            :edit-data="editingItem"
            @save="handleSaveCurriculumSubject"
          />

          <AddCurriculumSubjectDialog
            v-if="can('curriculum-subjects.create') && isAddDialogOpen"
            v-model:open="isAddDialogOpen"
            :subjects="subjects"
            :existing-subject-ids="existingSubjectIds"
            :saving="isSaving"
            @save="handleBulkSave"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
