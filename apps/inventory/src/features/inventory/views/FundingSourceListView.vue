<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { DataTable, ActionCell } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { h } from 'vue'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { useRoleGuard } from '@/features/platform/auth'
import { inventoryApi } from '../api/inventoryApi'
import FundingSourceFormDialog from '../components/FundingSourceFormDialog.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { InventoryReferenceItem } from '../types'

const { can } = useRoleGuard()

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
      header: 'Nama Sumber Dana',
    },
    {
      accessorKey: 'description',
      header: 'Keterangan',
      cell: ({ row }) => row.original.description ?? '-',
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
async function fetchFundingSources() {
  loading.value = true
  try {
    const response = await inventoryApi.getReferences(
      'funding-sources',
      searchQuery.value.trim() ? searchQuery.value.trim() : undefined,
    )
    dataItems.value = response.data.data ?? []
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat data sumber dana.'))
  } finally {
    loading.value = false
  }
}

// Save logic
async function handleSaveFundingSource(
  payload: Omit<InventoryReferenceItem, 'id'>,
) {
  isSaving.value = true
  try {
    if (selectedItem.value) {
      await inventoryApi.updateReference(
        'funding-sources',
        selectedItem.value.id,
        payload,
      )
      toast.success('Data sumber dana berhasil diperbarui.')
    } else {
      await inventoryApi.createReference('funding-sources', payload)
      toast.success('Sumber dana baru berhasil ditambahkan.')
    }
    isFormOpen.value = false
    await fetchFundingSources()
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal menyimpan data sumber dana.'),
    )
  } finally {
    isSaving.value = false
  }
}

// Delete logic
async function handleDeleteItem(id: string) {
  if (!confirm('Apakah Anda yakin ingin menghapus data sumber dana ini?'))
    return

  try {
    await inventoryApi.deleteReference('funding-sources', id)
    toast.success('Data sumber dana berhasil dihapus.')
    await fetchFundingSources()
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal menghapus data sumber dana.'),
    )
  }
}

// Modal Form Triggering
function handleOpenCreateForm() {
  selectedItem.value = null
  isFormOpen.value = true
}

// Open Edit Form
function handleOpenEditForm(item: InventoryReferenceItem) {
  selectedItem.value = item
  isFormOpen.value = true
}

// Search debounce
watchDebounced(
  searchQuery,
  () => {
    void fetchFundingSources()
  },
  { debounce: 300 },
)

onMounted(() => {
  void fetchFundingSources()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <Card class="border-slate-200 shadow-sm">
      <CardHeader
        class="flex flex-row items-center justify-between pb-4 border-b"
      >
        <CardTitle class="text-xl font-bold text-slate-800"
          >Sumber Dana</CardTitle
        >
        <Button
          v-if="can('inventory.create')"
          size="sm"
          @click="handleOpenCreateForm"
        >
          <Plus class="w-4 h-4 mr-2" />
          Tambah Sumber Dana
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
              placeholder="Cari kode atau nama sumber dana..."
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

    <!-- Funding Source Sheet Form -->
    <FundingSourceFormDialog
      v-model:open="isFormOpen"
      :item="selectedItem"
      :is-saving="isSaving"
      @save="handleSaveFundingSource"
    />
  </div>
</template>
