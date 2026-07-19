<script setup lang="ts">
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import PositionFormSheet from '../components/PositionFormSheet.vue'
import { usePosition } from '../composables/usePosition'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { createColumns } from '../components/columns'
import type { Position } from '../types'
import { watchDebounced } from '@vueuse/core'

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Jabatan', href: '/pengaturan/jabatan' },
]

const {
  items,
  totalItems,
  loading,
  searchQuery,
  fetchPositions,
  deletePosition,
} = usePosition()

const isAddOpen = ref(false)
const isEditDialogOpen = ref(false)
const selectedItem = ref<Position | null>(null)

const { isAdmin } = useRoleGuard()

const columns = createColumns({
  showActions: isAdmin.value,
  onEdit: (item: Position) => {
    selectedItem.value = item
    isEditDialogOpen.value = true
  },
  onDelete: async (item: Position, { closeAlert, setLoading }) => {
    setLoading(true)
    const success = await deletePosition(item.id)
    setLoading(false)
    if (success) {
      closeAlert()
    }
  },
})

watchDebounced(
  searchQuery,
  () => {
    void fetchPositions({ search: searchQuery.value })
  },
  { debounce: 400 },
)

onMounted(() => {
  void fetchPositions()
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
              Daftar Jabatan
            </CardTitle>
          </div>
          <div
            v-if="isAdmin"
            class="flex flex-col sm:flex-row w-full sm:w-auto gap-2"
          >
            <Button
              class="w-full sm:w-auto"
              @click="isAddOpen = true"
            >
              <Plus class="mr-2 h-4 w-4" /> Tambah Jabatan
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="items"
            :is-loading="loading"
            :total-items="totalItems"
            item-label="jabatan"
          >
            <template #header-right>
              <div class="relative w-full sm:w-[240px]">
                <Search
                  class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Cari jabatan..."
                  class="pl-9 h-8 w-full text-sm"
                />
              </div>
            </template>
          </DataTable>
        </div>
      </Card>

      <PositionFormSheet
        v-if="isAdmin"
        v-model:open="isAddOpen"
        @success="fetchPositions"
      />

      <PositionFormSheet
        v-if="isAdmin"
        v-model:open="isEditDialogOpen"
        :initial-data="selectedItem"
        @success="fetchPositions"
      />
    </div>
  </AppLayout>
</template>
