<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { onMounted } from 'vue'
import PositionCategoryFormDialog from '../components/PositionCategoryFormDialog.vue'
import { usePositionCategoryList } from '../composables/usePositionCategoryList'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { createColumns } from '../components/columns'

const {
  data,
  isLoading,
  fetchPositionCategories,
  deletePositionCategory,
  searchQuery,
  isAddOpen,
  isEditDialogOpen,
  selectedItem,
  openEditDialog,
} = usePositionCategoryList()

const { can } = useRoleGuard()
const columns = createColumns(
  openEditDialog,
  (item, callbacks) => {
    void deletePositionCategory(item.id, callbacks)
  },
  can('positions.update') || can('positions.delete'),
)

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Kategori Jabatan', href: '/pengaturan/kategori-jabatan' },
]

onMounted(() => {
  void fetchPositionCategories()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Kategori Jabatan
            </CardTitle>
          </div>
          <div
            v-if="can('positions.create')"
            class="flex flex-col sm:flex-row w-full sm:w-auto gap-2"
          >
            <Button
              class="w-full sm:w-auto"
              @click="isAddOpen = true"
            >
              <Plus class="mr-2 h-4 w-4" /> Tambah Kategori
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="data"
            :is-loading="isLoading"
            item-label="kategori jabatan"
          >
            <template #header-right>
              <div class="relative w-full sm:w-[240px]">
                <Search
                  class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Cari kategori..."
                  class="pl-9 h-8 w-full text-sm"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </Card>

      <PositionCategoryFormDialog
        v-if="can('positions.create')"
        v-model:open="isAddOpen"
        @success="fetchPositionCategories"
      />

      <PositionCategoryFormDialog
        v-if="can('positions.update')"
        v-model:open="isEditDialogOpen"
        :initial-data="selectedItem"
        @success="fetchPositionCategories"
      />
    </div>
  </AppLayout>
</template>
