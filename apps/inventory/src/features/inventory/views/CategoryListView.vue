<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { DataTable, ActionCell } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { h } from 'vue'
import { useRoleGuard } from '@/features/platform/auth'
import { inventoryReferenceCrud } from '../services/inventoryReferenceCrudService'
import CategoryFormDialog from '../components/CategoryFormDialog.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { InventoryReferenceItem } from '../types'

const { can } = useRoleGuard()
const reference = inventoryReferenceCrud('categories')

// State
const dataItems = ref<InventoryReferenceItem[]>([])
const loading = ref(false)
const isSaving = ref(false)
const isFormOpen = ref(false)
const selectedItem = ref<InventoryReferenceItem | null>(null)
const searchQuery = ref('')

// Columns configuration
const columns = computed<ColumnDef<InventoryReferenceItem>[]>(() => {
  const baseColumns: ColumnDef<InventoryReferenceItem>[] = [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'code',
      header: 'Kode',
    },
    {
      accessorKey: 'name',
      header: 'Nama',
    },
    {
      accessorKey: 'depreciationRatePercent',
      header: 'Penyusutan Tahunan',
      cell: ({ row }) => `${row.original.depreciationRatePercent ?? 0}%`,
    },
  ]

  if (can('inventory.update') || can('inventory.delete')) {
    baseColumns.push({
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) =>
        h(ActionCell, {
          hideEdit: !can('inventory.update'),
          hideDelete: !can('inventory.delete'),
          onEdit: () => handleOpenEditForm(row.original),
          onDelete: () => handleDeleteItem(row.original.id),
        }),
      enableSorting: false,
      enableHiding: false,
    })
  }

  return baseColumns
})

// Fetch logic
async function fetchCategories() {
  loading.value = true
  dataItems.value = await reference.list(searchQuery.value)
  loading.value = false
}

// Save logic
async function handleSaveCategory(payload: Omit<InventoryReferenceItem, 'id'>) {
  isSaving.value = true
  const saved = await reference.save(selectedItem.value?.id ?? null, payload)
  isSaving.value = false
  if (!saved) return
  isFormOpen.value = false
  await fetchCategories()
}

// Delete logic
async function handleDeleteItem(id: string) {
  if (!confirm('Apakah Anda yakin ingin menghapus data kategori ini?')) return

  if (await reference.remove(id)) await fetchCategories()
}

// Modal Form Triggering
function handleOpenCreateForm() {
  selectedItem.value = null
  isFormOpen.value = true
}

function handleOpenEditForm(item: InventoryReferenceItem) {
  selectedItem.value = item
  isFormOpen.value = true
}

// Search debounce
watchDebounced(
  searchQuery,
  () => {
    void fetchCategories()
  },
  { debounce: 300 },
)

onMounted(() => {
  void fetchCategories()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <Card class="border-slate-200 shadow-sm">
      <CardHeader
        class="flex flex-row items-center justify-between pb-4 border-b"
      >
        <CardTitle class="text-xl font-bold text-slate-800"
          >Kategori Aset</CardTitle
        >
        <Button
          v-if="can('inventory.create')"
          size="sm"
          @click="handleOpenCreateForm"
        >
          <Plus class="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </CardHeader>

      <div class="p-6 space-y-4">
        <!-- Filter/Search Bar -->
        <div class="flex items-center justify-between gap-4">
          <div class="relative w-full max-w-sm">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            />
            <Input
              v-model="searchQuery"
              placeholder="Cari kode atau nama kategori..."
              class="pl-9"
            />
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          :columns="columns"
          :data="dataItems"
          :loading="loading"
        />
      </div>
    </Card>

    <!-- Category Sheet Form -->
    <CategoryFormDialog
      v-model:open="isFormOpen"
      :item="selectedItem"
      :is-saving="isSaving"
      @save="handleSaveCategory"
    />
  </div>
</template>
