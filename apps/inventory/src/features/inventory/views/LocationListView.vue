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
import LocationFormDialog from '../components/LocationFormDialog.vue'
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
      header: 'Nama Lokasi',
    },
    {
      accessorKey: 'building',
      header: 'Gedung',
      cell: ({ row }) => row.original.building ?? '-',
    },
    {
      accessorKey: 'room',
      header: 'Ruangan',
      cell: ({ row }) => row.original.room ?? '-',
    },
    {
      accessorKey: 'rack',
      header: 'Rak',
      cell: ({ row }) => row.original.rack ?? '-',
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
async function fetchLocations() {
  loading.value = true
  try {
    const response = await inventoryApi.getReferences(
      'locations',
      searchQuery.value.trim() ? searchQuery.value.trim() : undefined,
    )
    dataItems.value = response.data.data ?? []
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat data lokasi.'))
  } finally {
    loading.value = false
  }
}

// Save logic
async function handleSaveLocation(payload: Omit<InventoryReferenceItem, 'id'>) {
  isSaving.value = true
  try {
    if (selectedItem.value) {
      await inventoryApi.updateReference(
        'locations',
        selectedItem.value.id,
        payload,
      )
      toast.success('Data lokasi berhasil diperbarui.')
    } else {
      await inventoryApi.createReference('locations', payload)
      toast.success('Lokasi baru berhasil ditambahkan.')
    }
    isFormOpen.value = false
    await fetchLocations()
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menyimpan data lokasi.'))
  } finally {
    isSaving.value = false
  }
}

// Delete logic
async function handleDeleteItem(id: string) {
  if (!confirm('Apakah Anda yakin ingin menghapus data lokasi ini?')) return

  try {
    await inventoryApi.deleteReference('locations', id)
    toast.success('Data lokasi berhasil dihapus.')
    await fetchLocations()
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menghapus data lokasi.'))
  }
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
    void fetchLocations()
  },
  { debounce: 300 },
)

onMounted(() => {
  void fetchLocations()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <Card class="border-slate-200 shadow-sm">
      <CardHeader
        class="flex flex-row items-center justify-between pb-4 border-b"
      >
        <CardTitle class="text-xl font-bold text-slate-800"
          >Daftar Lokasi</CardTitle
        >
        <Button
          v-if="can('inventory.create')"
          size="sm"
          @click="handleOpenCreateForm"
        >
          <Plus class="w-4 h-4 mr-2" />
          Tambah Lokasi
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
              placeholder="Cari kode, nama, atau gedung..."
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

    <!-- Location Sheet Form -->
    <LocationFormDialog
      v-model:open="isFormOpen"
      :item="selectedItem"
      :is-saving="isSaving"
      @save="handleSaveLocation"
    />
  </div>
</template>
