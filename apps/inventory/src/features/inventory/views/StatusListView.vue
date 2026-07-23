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
import { useRoleGuard } from '@/features/platform/auth'
import { inventoryApi } from '../api/inventoryApi'
import StatusFormDialog from '../components/StatusFormDialog.vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { InventoryReferenceItem, InventoryStatusKey } from '../types'

const { can } = useRoleGuard()

const SYSTEM_KEY_LABELS: Record<InventoryStatusKey, string> = {
  AVAILABLE: 'Tersedia',
  LOAN_PENDING: 'Menunggu Persetujuan',
  LOAN_APPROVED: 'Pinjam Disetujui',
  LOANED: 'Sedang Dipinjam',
  LOAN_RETURNED: 'Baru Dikembalikan',
  LOAN_REJECTED: 'Pinjam Ditolak',
}

// State
const dataItems = ref<InventoryReferenceItem[]>([])
const loading = ref(false)
const isSaving = ref(false)
const isFormOpen = ref(false)
const selectedItem = ref<InventoryReferenceItem | null>(null)
const searchQuery = ref('')

const breadcrumbs = [
  { title: 'Referensi', href: '#' },
  { title: 'Status Aset', href: '/inventory/statuses' },
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
      header: 'Nama Status',
    },
    {
      accessorKey: 'allowTransactions',
      header: 'Bisa Dipinjam',
      cell: ({ row }) => {
        const allow = row.original.allowTransactions
        return h(Badge, { variant: allow ? 'default' : 'destructive' }, () =>
          allow ? 'Diizinkan' : 'Dilarang',
        )
      },
    },
    {
      accessorKey: 'systemKey',
      header: 'Peran Sistem',
      cell: ({ row }) => {
        const key = row.original.systemKey
        if (!key) {
          return h('span', { class: 'text-muted-foreground' }, '-')
        }
        return h(Badge, { variant: 'outline' }, () => SYSTEM_KEY_LABELS[key])
      },
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
async function fetchStatuses() {
  loading.value = true
  try {
    const response = await inventoryApi.getReferences(
      'statuses',
      searchQuery.value.trim() ? searchQuery.value.trim() : undefined,
    )
    dataItems.value = response.data.data ?? []
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat data status aset.'))
  } finally {
    loading.value = false
  }
}

// Save logic
async function handleSaveStatus(payload: Omit<InventoryReferenceItem, 'id'>) {
  isSaving.value = true
  try {
    if (selectedItem.value) {
      await inventoryApi.updateReference(
        'statuses',
        selectedItem.value.id,
        payload,
      )
      toast.success('Data status aset berhasil diperbarui.')
    } else {
      await inventoryApi.createReference('statuses', payload)
      toast.success('Status aset baru berhasil ditambahkan.')
    }
    isFormOpen.value = false
    await fetchStatuses()
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal menyimpan data status aset.'),
    )
  } finally {
    isSaving.value = false
  }
}

// Delete logic
async function handleDeleteItem(id: string) {
  if (!confirm('Apakah Anda yakin ingin menghapus data status ini?')) return

  try {
    await inventoryApi.deleteReference('statuses', id)
    toast.success('Data status berhasil dihapus.')
    await fetchStatuses()
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal menghapus data status aset.'),
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
    void fetchStatuses()
  },
  { debounce: 300 },
)

onMounted(() => {
  void fetchStatuses()
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
            >Status Aset</CardTitle
          >
          <Button
            v-if="can('inventory.create')"
            size="sm"
            @click="handleOpenCreateForm"
          >
            <Plus class="w-4 h-4 mr-2" />
            Tambah Status
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
                placeholder="Cari kode atau nama status..."
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

      <!-- Status Sheet Form -->
      <StatusFormDialog
        v-model:open="isFormOpen"
        :item="selectedItem"
        :is-saving="isSaving"
        :existing-statuses="dataItems"
        @save="handleSaveStatus"
      />
    </div>
  </AppLayout>
</template>
