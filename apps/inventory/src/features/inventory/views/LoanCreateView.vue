<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { DataTable, Badge, DatePicker } from '@/ui'
import { ChevronLeft } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type { InventoryAssetUnit } from '../types'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { assetService } from '../services/assetService'
import { loanService } from '../services/loanService'
import { PAGINATION } from '@/shared/constants/pagination'

// A selectable row = one available unit, flattened with its parent asset info.
type LoanUnitRow = InventoryAssetUnit & {
  assetName: string
  categoryName: string
}

const router = useRouter()
const isSubmitting = ref(false)
const loadingUnits = ref(false)
const availableUnits = ref<LoanUnitRow[]>([])
const selectedUnits = ref<LoanUnitRow[]>([])

const createForm = ref({
  purpose: '',
  expectedReturnDate: '',
})

const selectColumn: ColumnDef<LoanUnitRow> = {
  id: 'select',
  header: ({ table }) =>
    h('input', {
      type: 'checkbox',
      checked: table.getIsAllPageRowsSelected(),
      indeterminate: table.getIsSomePageRowsSelected(),
      onChange: (e: Event) =>
        table.toggleAllPageRowsSelected((e.target as HTMLInputElement).checked),
      class: 'h-4 w-4 rounded border-gray-300 cursor-pointer',
    }),
  cell: ({ row }) =>
    h('input', {
      type: 'checkbox',
      checked: row.getIsSelected(),
      onChange: (e: Event) =>
        row.toggleSelected((e.target as HTMLInputElement).checked),
      class: 'h-4 w-4 rounded border-gray-300 cursor-pointer',
    }),
  enableSorting: false,
  enableHiding: false,
}

const columns: ColumnDef<LoanUnitRow>[] = [
  selectColumn,
  {
    id: 'unitNumber',
    header: 'No. Unit',
    cell: ({ row }) => row.original.unitNumber,
    accessorKey: 'unitNumber',
  },
  {
    id: 'assetName',
    header: 'Nama Aset',
    cell: ({ row }) => row.original.assetName,
    accessorKey: 'assetName',
  },
  {
    id: 'categoryName',
    header: 'Kategori',
    cell: ({ row }) => row.original.categoryName,
    accessorKey: 'categoryName',
  },
  {
    id: 'location',
    header: 'Lokasi',
    cell: ({ row }) => {
      const loc = row.original.location
      return loc ? `${loc.name} (${loc.building ?? ''})` : '-'
    },
    accessorFn: (row) => row.location?.name,
  },
  {
    id: 'condition',
    header: 'Kondisi',
    cell: ({ row }) => {
      const cond = row.original.condition
      if (!cond) return '-'
      const variant = cond.isUsable ? 'outline' : 'destructive'
      return h(Badge, { variant }, () => cond.name)
    },
    accessorFn: (row) => row.condition?.name,
  },
]

async function loadAvailableUnits() {
  loadingUnits.value = true
  try {
    // `lendable` is the backend's rule, and the same one it enforces when the
    // loan is submitted. This used to read a thousand assets with every unit
    // attached and apply that rule here, which meant the browser held a second
    // copy of it — and a unit already reserved by a pending loan was excluded
    // only because its status happened to say so.
    const { items } = await assetService.listUnits({
      lendable: true,
      limit: PAGINATION.REFERENCE_LIMIT,
    })
    availableUnits.value = items.map((u) => ({
      ...u,
      assetName: u.asset?.name ?? '-',
      categoryName: u.asset?.category?.name ?? '-',
    }))
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memuat daftar unit tersedia.'),
    )
  } finally {
    loadingUnits.value = false
  }
}

onMounted(() => {
  void loadAvailableUnits()
})

function handleSelectionChange(rows: LoanUnitRow[]) {
  selectedUnits.value = rows
}

async function handleCreateLoan() {
  if (selectedUnits.value.length === 0) {
    toast.error('Pilih minimal satu unit untuk dipinjam.')
    return
  }

  isSubmitting.value = true
  try {
    const created = await loanService.create({
      purpose: createForm.value.purpose,
      expectedReturnDate: createForm.value.expectedReturnDate,
      unitIds: selectedUnits.value.map((u) => u.id),
    })
    if (created) void router.push({ name: 'inventory-loans' })
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal membuat pengajuan peminjaman.'),
    )
  } finally {
    isSubmitting.value = false
  }
}

function handleCancel() {
  void router.push({ name: 'inventory-loans' })
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8 w-full">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader class="flex flex-row items-center gap-4 border-b px-6 py-5">
        <Button
          variant="outline"
          size="icon"
          @click="handleCancel"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight"
            >Pinjam Aset Baru</CardTitle
          >
          <p class="text-sm text-muted-foreground mt-1">
            Ajukan permohonan peminjaman logistik sekolah baru.
          </p>
        </div>
      </CardHeader>
      <CardContent class="p-6">
        <form
          class="space-y-6"
          @submit.prevent="handleCreateLoan"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div class="space-y-1">
              <Label for="purpose"
                >Tujuan Peminjaman
                <span class="text-destructive">*</span></Label
              >
              <Input
                id="purpose"
                v-model="createForm.purpose"
                required
                placeholder="Contoh: Kegiatan Ujian Akhir Sekolah di Lab"
                :disabled="isSubmitting"
              />
            </div>

            <div class="space-y-1 flex flex-col">
              <Label
                class="mb-1"
                for="expectedReturnDate"
                >Rencana Tanggal Pengembalian
                <span class="text-destructive">*</span></Label
              >
              <DatePicker
                id="expectedReturnDate"
                :model-value="createForm.expectedReturnDate"
                :allow-future-dates="true"
                :disabled="isSubmitting"
                @update:model-value="createForm.expectedReturnDate = $event"
              />
            </div>
          </div>

          <div class="space-y-3">
            <Label class="text-base font-semibold"
              >Pilih Unit Tersedia
              <span class="text-destructive">*</span></Label
            >
            <DataTable
              :columns="columns"
              :data="availableUnits"
              :is-loading="loadingUnits"
              item-label="unit tersedia"
              @selection-change="handleSelectionChange"
            />
          </div>

          <div class="flex items-center justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              :disabled="isSubmitting"
              @click="handleCancel"
            >
              Batal
            </Button>
            <Button
              type="submit"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
