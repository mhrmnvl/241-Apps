<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { onMounted } from 'vue'
import OccupationFormDialog from '../components/OccupationFormDialog.vue'
import { useOccupationList } from '../composables/useOccupationList'
import { useRoleGuard } from '@/features/platform/auth'
import { createColumns } from '../components/columns'

const {
  data,
  isLoading,
  fetchOccupations,
  deleteOccupation,
  searchQuery,
  isAddOpen,
  isEditDialogOpen,
  selectedItem,
  openEditDialog,
} = useOccupationList()

const { can } = useRoleGuard()
const columns = createColumns(
  openEditDialog,
  (id, callbacks) => {
    void deleteOccupation(id, callbacks)
  },
  can('occupations.update') || can('occupations.delete'),
)

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Pekerjaan', href: '/setting/occupation' },
]

onMounted(() => {
  void fetchOccupations()
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
              Daftar Pekerjaan
            </CardTitle>
          </div>
          <div
            v-if="can('occupations.create')"
            class="flex flex-col sm:flex-row w-full sm:w-auto gap-2"
          >
            <Button
              class="w-full sm:w-auto"
              @click="isAddOpen = true"
            >
              <Plus class="mr-2 h-4 w-4" /> Tambah Pekerjaan
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="data"
            :is-loading="isLoading"
            item-label="pekerjaan"
          >
            <template #header-right>
              <div class="relative w-full sm:w-[240px]">
                <Search
                  class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Cari pekerjaan..."
                  class="pl-9 h-8 w-full text-sm"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </Card>

      <OccupationFormDialog
        v-if="can('occupations.create')"
        v-model:open="isAddOpen"
        @success="fetchOccupations"
      />

      <OccupationFormDialog
        v-if="can('occupations.update')"
        v-model:open="isEditDialogOpen"
        :initial-data="selectedItem"
        @success="fetchOccupations"
      />
    </div>
  </AppLayout>
</template>
