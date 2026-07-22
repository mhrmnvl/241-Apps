<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { onMounted } from 'vue'
import AchievementTypeFormDialog from '../components/AchievementTypeFormDialog.vue'
import { useAchievementTypeList } from '../composables/useAchievementTypeList'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { createColumns } from '../components/columns'

const {
  data,
  isLoading,
  fetchAchievementTypes,
  deleteAchievementType,
  searchQuery,
  isAddOpen,
  isEditDialogOpen,
  selectedItem,
  openEditDialog,
} = useAchievementTypeList()

const { can } = useRoleGuard()
const columns = createColumns(
  openEditDialog,
  (item, callbacks) => {
    void deleteAchievementType(item.id, callbacks)
  },
  can('achievement-types.update') || can('achievement-types.delete'),
)

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Tingkat Prestasi', href: '/pengaturan/achievement-type' },
]

onMounted(() => {
  void fetchAchievementTypes()
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
              Tingkat Prestasi
            </CardTitle>
          </div>
          <div
            v-if="can('achievement-types.create')"
            class="flex flex-col sm:flex-row w-full sm:w-auto gap-2"
          >
            <Button
              class="w-full sm:w-auto"
              @click="isAddOpen = true"
            >
              <Plus class="mr-2 h-4 w-4" /> Tambah Tingkat Prestasi
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="data"
            :is-loading="isLoading"
            item-label="tingkat prestasi"
          >
            <template #header-right>
              <div class="relative w-full sm:w-[240px]">
                <Search
                  class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Cari tingkat prestasi..."
                  class="pl-9 h-8 w-full text-sm"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </Card>

      <AchievementTypeFormDialog
        v-if="can('achievement-types.create')"
        v-model:open="isAddOpen"
        @success="fetchAchievementTypes"
      />

      <AchievementTypeFormDialog
        v-if="can('achievement-types.update')"
        v-model:open="isEditDialogOpen"
        :initial-data="selectedItem"
        @success="fetchAchievementTypes"
      />
    </div>
  </AppLayout>
</template>
