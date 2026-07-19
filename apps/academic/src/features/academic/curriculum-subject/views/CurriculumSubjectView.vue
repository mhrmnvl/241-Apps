<script setup lang="ts">
import type { CurriculumSubject, CurriculumSubjectSavePayload } from '../types'
import CurriculumSubjectFormSheet from '../components/CurriculumSubjectFormSheet.vue'
import { createCurriculumSubjectColumns } from '../components/columns'
import { useCurriculumSubject } from '../composables/useCurriculumSubject'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/ui/card'
import { Label } from '@/ui/label'
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
  classroomLevels,
  selectedClassroomLevelId,
  curriculumName,
  curriculumAcademicYear,
  fetchReferenceData,
  fetchCurriculumSubjects,
  fetchCurriculumInfo,
  saveCurriculumSubject,
  deleteCurriculumSubject,
} = useCurriculumSubject()

const breadcrumbs = computed(() => [
  { title: 'Akademik', href: '#' },
  { title: 'Kurikulum', href: '/akademik/kurikulum' },
  { title: curriculumName.value || 'Detail', href: route.path },
])

const isAddModalOpen = ref(false)
const editingItem = ref<CurriculumSubject | null>(null)
const { isAdmin } = useRoleGuard()

const classroomLevelFilterOptions = computed<ComboboxOption[]>(() => [
  { value: '', label: 'Semua Tingkat Kelas' },
  ...classroomLevels.value.map((c) => ({
    value: c.id,
    label: c.name ?? '-',
  })),
])

const tableColumns = createCurriculumSubjectColumns({
  showActions: isAdmin.value,
  onEdit: (item: CurriculumSubject) => {
    editingItem.value = item
    isAddModalOpen.value = true
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
    isAddModalOpen.value = false
    void fetchCurriculumSubjects(curriculumId)
  }
}

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

watch(selectedClassroomLevelId, () => {
  void fetchCurriculumSubjects(curriculumId)
})

onMounted(async () => {
  selectedClassroomLevelId.value = ''
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
              @click="router.push('/akademik/kurikulum')"
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
            v-if="isAdmin"
            @click="isAddModalOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6 space-y-6">
          <div class="rounded-lg border bg-muted/20 p-4">
            <div class="grid items-end gap-4 sm:grid-cols-1">
              <div class="grid gap-2 max-w-xs">
                <Label>Tingkat Kelas</Label>
                <AppCombobox
                  v-model="selectedClassroomLevelId"
                  :options="classroomLevelFilterOptions"
                  placeholder="Pilih Tingkat Kelas"
                  search-placeholder="Cari tingkat kelas..."
                  empty-text="Tingkat kelas tidak ditemukan."
                />
              </div>
            </div>
          </div>

          <DataTable
            :columns="tableColumns"
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="mata pelajaran kurikulum"
            filter-column="subject"
            filter-placeholder="Cari mata pelajaran..."
          />

          <CurriculumSubjectFormSheet
            v-if="isAdmin && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :form-error="formError"
            :is-saving="isSaving"
            :curriculum-id="curriculumId"
            :edit-data="editingItem"
            @save="handleSaveCurriculumSubject"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
