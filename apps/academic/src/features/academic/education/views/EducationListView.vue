<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { onMounted } from 'vue'
import EducationFormDialog from '../components/EducationFormDialog.vue'
import { useEducationList } from '../composables/useEducationList'
import { useRoleGuard } from '@/features/platform/auth'
import { createColumns } from '../components/columns'

const {
  data,
  isLoading,
  fetchEducationLevels,
  deleteEducationLevel,
  searchQuery,
  isAddOpen,
  isEditDialogOpen,
  selectedItem,
  openEditDialog,
} = useEducationList()

const { can } = useRoleGuard()
const columns = createColumns(
  openEditDialog,
  (item, callbacks) => {
    void deleteEducationLevel(item.id, callbacks)
  },
  can('educations.update') || can('educations.delete'),
)

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Tingkat Pendidikan', href: '/setting/education-level' },
]

onMounted(() => {
  void fetchEducationLevels()
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
              Tingkat Pendidikan
            </CardTitle>
          </div>
          <div
            v-if="can('educations.create')"
            class="flex flex-col sm:flex-row w-full sm:w-auto gap-2"
          >
            <Button
              class="w-full sm:w-auto"
              @click="isAddOpen = true"
            >
              <Plus class="mr-2 h-4 w-4" /> Tambah Tingkat
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="data"
            :is-loading="isLoading"
            item-label="tingkat pendidikan"
          >
            <template #header-right>
              <div class="relative w-full sm:w-[240px]">
                <Search
                  class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Cari tingkat..."
                  class="pl-9 h-8 w-full text-sm"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </Card>

      <EducationFormDialog
        v-if="can('educations.create')"
        v-model:open="isAddOpen"
        @success="fetchEducationLevels"
      />

      <EducationFormDialog
        v-if="can('educations.update')"
        v-model:open="isEditDialogOpen"
        :initial-data="selectedItem"
        @success="fetchEducationLevels"
      />
    </div>
  </AppLayout>
</template>
