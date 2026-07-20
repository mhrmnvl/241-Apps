<script setup lang="ts">
import type { Grade } from '../types'
import { createGradeColumns } from '../components/columns'
import GradeFormSheet from '../components/GradeFormSheet.vue'
import { useGradeList } from '../composables/useGradeList'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus } from 'lucide-vue-next'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { onMounted, ref, watch } from 'vue'

const breadcrumbs = [
  { title: 'Akademik', href: '#' },
  { title: 'Tingkat Kelas', href: '/akademik/tingkat-kelas' },
]

const { items, totalItems, loading, fetchGrades, deleteGrade } = useGradeList()

const isAddModalOpen = ref(false)
const editingItem = ref<Grade | null>(null)
const { isAdmin } = useRoleGuard()

const tableColumns = createGradeColumns({
  showActions: isAdmin.value,
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
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="tingkat kelas"
            filter-column="name"
            filter-placeholder="Cari tingkat kelas..."
          />

          <GradeFormSheet
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
