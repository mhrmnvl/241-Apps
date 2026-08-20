<script setup lang="ts">
import type { Curriculum } from '../types'
import CurriculumFormDialog from '../components/CurriculumFormDialog.vue'
import { createCurriculumColumns } from '../components/columns'
import { useCurriculumList } from '../composables/useCurriculumList'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { useRoleGuard } from '@/features/platform/auth'
import { Plus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'

const router = useRouter()
const {
  curricula,
  academicYears,
  loading,
  fetchCurricula,
  fetchAcademicYears,
  deleteCurriculum,
} = useCurriculumList()

const isAddModalOpen = ref(false)
const editingItem = ref<Curriculum | null>(null)
const { can } = useRoleGuard()

const tableColumns = createCurriculumColumns({
  showActions: can('curricula.update') || can('curricula.delete'),
  canUpdate: can('curricula.update'),
  canDelete: can('curricula.delete'),
  onView: (item: Curriculum) => {
    void router.push(`/academic/curriculum/${item.id}/subject`)
  },
  onEdit: (item: Curriculum) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: Curriculum, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteCurriculum(item.id)
    if (result.success) {
      refetchCurrentYear()
      closeAlert()
    }
    setLoading(false)
  },
})

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
  }
})

/**
 * A curriculum belongs to one academic year, so an earlier year's curricula
 * are only reachable by selecting that year.
 */
const selectedAcademicYearId = ref('')

function onAcademicYearChange(value: unknown) {
  const academicYearId = typeof value === 'string' ? value : ''
  selectedAcademicYearId.value = academicYearId
  void fetchCurricula(academicYearId || undefined)
}

/** Refetch after a save without losing the year the user is looking at. */
function refetchCurrentYear() {
  void fetchCurricula(selectedAcademicYearId.value || undefined)
}

onMounted(async () => {
  await Promise.all([fetchCurricula(), fetchAcademicYears()])
  selectedAcademicYearId.value =
    academicYears.value.find((y) => y.isActive)?.id ?? ''
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
          Kurikulum
        </CardTitle>
        <Button
          v-if="can('curricula.create')"
          @click="isAddModalOpen = true"
        >
          <Plus class="size-4 mr-2" />
          Tambah
        </Button>
      </CardHeader>

      <div class="p-6 space-y-4">
        <DataTable
          :columns="tableColumns"
          :data="curricula"
          :is-loading="loading"
          item-label="kurikulum"
          filter-column="name"
          filter-placeholder="Cari kurikulum..."
        >
          <template #header-right>
            <Select
              :model-value="selectedAcademicYearId"
              @update:model-value="onAcademicYearChange"
            >
              <SelectTrigger class="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Tahun Ajaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="year in academicYears"
                  :key="year.id"
                  :value="year.id"
                >
                  {{ year.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </template>
        </DataTable>

        <CurriculumFormDialog
          v-if="isAddModalOpen"
          v-model:open="isAddModalOpen"
          :academic-years="academicYears"
          :edit-data="editingItem"
          @save-success="refetchCurrentYear"
        />
      </div>
    </Card>
  </div>
</template>
