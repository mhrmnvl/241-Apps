<script setup lang="ts">
import type { ClassroomLevel } from '../types'
import { createClassroomLevelColumns } from '../components/columns'
import ClassroomLevelFormSheet from '../components/ClassroomLevelFormSheet.vue'
import { useClassroomLevelList } from '../composables/useClassroomLevelList'
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

const {
  items,
  totalItems,
  loading,
  fetchClassroomLevels,
  deleteClassroomLevel,
} = useClassroomLevelList()

const isAddModalOpen = ref(false)
const editingItem = ref<ClassroomLevel | null>(null)
const { isAdmin } = useRoleGuard()

const tableColumns = createClassroomLevelColumns({
  showActions: isAdmin.value,
  onEdit: (item: ClassroomLevel) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: ClassroomLevel, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteClassroomLevel(item.id)
    if (result.success) {
      await fetchClassroomLevels()
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
  void fetchClassroomLevels()
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

          <ClassroomLevelFormSheet
            v-if="isAdmin && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :edit-data="editingItem"
            @save-success="fetchClassroomLevels"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
