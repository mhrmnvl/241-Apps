<script setup lang="ts">
import type { Curricula } from '../types'
import CurriculaFormSheet from '../components/CurriculaFormSheet.vue'
import { createCurriculaColumns } from '../components/columns'
import { useCurriculaList } from '../composables/useCurriculaList'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { Plus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'

const router = useRouter()
const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Kurikulum', href: '/academic/curriculum' },
]

const {
  curricula,
  academicYears,
  totalCurricula,
  loading,
  fetchCurricula,
  fetchAcademicYears,
  deleteCurriculum,
} = useCurriculaList()

const isAddModalOpen = ref(false)
const editingItem = ref<Curricula | null>(null)
const { can } = useRoleGuard()

const tableColumns = createCurriculaColumns({
  showActions: can('curricula.update') || can('curricula.delete'),
  canUpdate: can('curricula.update'),
  canDelete: can('curricula.delete'),
  onView: (item: Curricula) => {
    void router.push(`/academic/curriculum/${item.id}/mata-pelajaran`)
  },
  onEdit: (item: Curricula) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: Curricula, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteCurriculum(item.id)
    if (result.success) {
      await fetchCurricula()
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

onMounted(() => {
  void fetchCurricula()
  void fetchAcademicYears()
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
            :total-items="totalCurricula"
            :is-loading="loading"
            item-label="kurikulum"
            filter-column="name"
            filter-placeholder="Cari kurikulum..."
          />

          <CurriculaFormSheet
            v-if="can('curricula.create') && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :academic-years="academicYears"
            :edit-data="editingItem"
            @save-success="fetchCurricula"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
