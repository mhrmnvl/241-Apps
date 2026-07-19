<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable, ActionCell } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Badge } from '@/ui/badge'
import { Plus, Search } from 'lucide-vue-next'
import { h } from 'vue'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { inventoryApi } from '../api/inventoryApi'
import ConditionFormSheet from '../components/ConditionFormSheet.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { InventoryReferenceItem } from '../types'

const { isAdmin } = useRoleGuard()

// State
const dataItems = ref<InventoryReferenceItem[]>([])
const loading = ref(false)
const isSaving = ref(false)
const isFormOpen = ref(false)
const selectedItem = ref<InventoryReferenceItem | null>(null)
const searchQuery = ref('')

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Kondisi Aset' },
]

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
      header: 'Nama Kondisi',
    },
    {
      accessorKey: 'isUsable',
      header: 'Kelayakan Pakai',
      cell: ({ row }) => {
        const isUsable = row.original.isUsable
        return h(
          Badge,
          { variant: isUsable ? 'default' : 'destructive' },
          () => (isUsable ? 'Layak Pakai' : 'Tidak Layak Pakai'),
        )
      },
    },
  ]

  if (isAdmin.value) {
    baseColumns.push({
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) =>
        h(ActionCell, {
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
async function fetchConditions() {
  loading.value = true
  try {
    const response = await inventoryApi.getReferences(
      'conditions',
      searchQuery.value.trim() ? searchQuery.value.trim() : undefined,
    )
    dataItems.value = response.data.data ?? []
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat data kondisi aset.'))
  } finally {
    loading.value = false
  }
}

// Save logic
async function handleSaveCondition(
  payload: Omit<InventoryReferenceItem, 'id'>,
) {
  isSaving.value = true
  try {
    if (selectedItem.value) {
      await inventoryApi.updateReference(
        'conditions',
        selectedItem.value.id,
        payload,
      )
      toast.success('Data kondisi aset berhasil diperbarui.')
    } else {
      await inventoryApi.createReference('conditions', payload)
      toast.success('Kondisi aset baru berhasil ditambahkan.')
    }
    isFormOpen.value = false
    await fetchConditions()
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal menyimpan data kondisi aset.'),
    )
  } finally {
    isSaving.value = false
  }
}

// Delete logic
async function handleDeleteItem(id: string) {
  if (!confirm('Apakah Anda yakin ingin menghapus data kondisi ini?')) return

  try {
    await inventoryApi.deleteReference('conditions', id)
    toast.success('Data kondisi berhasil dihapus.')
    await fetchConditions()
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal menghapus data kondisi aset.'),
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
    void fetchConditions()
  },
  { debounce: 300 },
)

onMounted(() => {
  void fetchConditions()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-6 space-y-6">
      <Card class="border-slate-200 shadow-sm">
        <CardHeader
          class="flex flex-row items-center justify-between pb-4 border-b"
        >
          <CardTitle class="text-xl font-bold text-slate-800"
            >Kondisi Aset</CardTitle
          >
          <Button
            v-if="isAdmin"
            size="sm"
            @click="handleOpenCreateForm"
          >
            <Plus class="w-4 h-4 mr-2" />
            Tambah Kondisi
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
                placeholder="Cari kode atau nama kondisi..."
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

      <!-- Condition Sheet Form -->
      <ConditionFormSheet
        v-model:open="isFormOpen"
        :item="selectedItem"
        :is-saving="isSaving"
        @save="handleSaveCondition"
      />
    </div>
  </AppLayout>
</template>
