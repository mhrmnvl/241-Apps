<script setup lang="ts">
import type { Grade } from '../types'
import { createGradeColumns } from '../components/columns'
import GradeFormDialog from '../components/GradeFormDialog.vue'
import { useGradeList } from '../composables/useGradeList'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus, Search } from 'lucide-vue-next'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { Input } from '@/ui/input'

const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Tingkat Kelas', href: '/akademik/tingkat-kelas' },
]

const { items, totalItems, loading, currentFilters, fetchGrades, deleteGrade } =
  useGradeList()
const searchKeyword = ref(currentFilters.value.search ?? '')

watchDebounced(
  searchKeyword,
  (val) => {
    void fetchGrades({
      search: val.trim() || '',
      page: 1,
    })
  },
  { debounce: 500 },
)

const isAddModalOpen = ref(false)
const editingItem = ref<Grade | null>(null)
const { can } = useRoleGuard()

const tableColumns = createGradeColumns({
  showActions: can('academic-years.update') || can('academic-years.delete'),
  canUpdate: can('academic-years.update'),
  canDelete: can('academic-years.delete'),
  onEdit: (item: Grade) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: Grade, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteGrade(item.id)
    if (result.success) {
      await fetchGrades()
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
  void fetchGrades()
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
            Tingkat Kelas
          </CardTitle>
          <Button
            v-if="can('academic-years.create')"
            @click="isAddModalOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6 space-y-4">
          <DataTable
            :columns="tableColumns"
            :data="items"
            :total-items="totalItems"
            :page="currentFilters.page"
            :is-loading="loading"
            item-label="tingkat kelas"
            @update:page="(page) => fetchGrades({ page })"
            @update:page-size="(limit) => fetchGrades({ limit, page: 1 })"
          >
            <template #header-right>
              <div class="relative w-48">
                <Search
                  class="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground"
                />
                <Input
                  v-model="searchKeyword"
                  placeholder="Cari tingkat kelas..."
                  class="h-8 pl-8 w-full text-xs"
                />
              </div>
            </template>
          </DataTable>

          <GradeFormDialog
            v-if="isAddModalOpen"
            v-model:open="isAddModalOpen"
            :edit-data="editingItem"
            @save-success="fetchGrades"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
