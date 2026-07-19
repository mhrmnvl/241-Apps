<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, RotateCcw } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable, Badge } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { inventoryApi } from '../api/inventoryApi'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type {
  InventoryLoan,
  InventoryMetadata,
  InventoryStatus,
  InventoryLoanItem,
} from '../types'

const breadcrumbs = [
  { title: 'Inventaris', href: '#' },
  { title: 'Transaksi Peminjaman' },
]

// State
const loans = ref<InventoryLoan[]>([])
const router = useRouter()
const loading = ref(false)
const isSubmitting = ref(false)
const metadata = ref<InventoryMetadata | null>(null)

// Dialog States
const isReturnOpen = ref(false)
const selectedLoanForReturn = ref<InventoryLoan | null>(null)

// Form States
const returnForm = ref({
  items: [] as {
    assetId: string
    returnedConditionId: string
    notes: string
  }[],
})

// Load metadata and assets
async function loadData() {
  loading.value = true
  try {
    const [metaRes, loansRes] = await Promise.all([
      inventoryApi.getInventoryMetadata(),
      inventoryApi.getLoans(),
    ])
    metadata.value = metaRes.data?.data ?? null
    loans.value = loansRes.data?.data ?? []
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memuat data peminjaman.'),
    )
  } finally {
    loading.value = false
  }
}

// Removed unused openCreateDialog and handleCreateLoan

function openReturnDialog(loan: InventoryLoan) {
  selectedLoanForReturn.value = loan
  returnForm.value.items = loan.items.map((item: InventoryLoanItem) => ({
    assetId: item.assetId,
    returnedConditionId: item.asset?.conditionId ?? '',
    notes: '',
  }))
  isReturnOpen.value = true
}

async function handleReturnLoan() {
  if (!selectedLoanForReturn.value) return
  isSubmitting.value = true
  try {
    await inventoryApi.returnLoan(selectedLoanForReturn.value.id, {
      items: returnForm.value.items,
    })
    toast.success('Pengembalian aset berhasil diproses.')
    isReturnOpen.value = false
    await loadData()
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memproses pengembalian.'),
    )
  } finally {
    isSubmitting.value = false
  }
}

// Columns definition
const columns: ColumnDef<InventoryLoan>[] = [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    id: 'loanNumber',
    header: 'No. Pinjam',
    cell: ({ row }) => row.original.loanNumber,
  },
  {
    id: 'purpose',
    header: 'Tujuan',
    cell: ({ row }) => row.original.purpose,
  },
  {
    id: 'assets',
    header: 'Aset',
    cell: ({ row }) => {
      const items = row.original.items ?? []
      return items.map((i: InventoryLoanItem) => i.asset?.name).join(', ')
    },
  },
  {
    id: 'expectedReturnDate',
    header: 'Batas Kembali',
    cell: ({ row }) => {
      const d = row.original.expectedReturnDate
      return d ? new Date(d).toLocaleDateString('id-ID') : '-'
    },
  },
  {
    id: 'actualReturnDate',
    header: 'Tgl Kembali',
    cell: ({ row }) => {
      const d = row.original.actualReturnDate
      return d ? new Date(d).toLocaleDateString('id-ID') : '-'
    },
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const loan = row.original
      const status = metadata.value?.statuses.find(
        (s: InventoryStatus) => s.id === loan.statusId,
      )
      if (!status) return '-'

      let variant: 'default' | 'secondary' | 'destructive' | 'outline' =
        'outline'
      if (status.code === 'STAT-LOAN-APPROVED') variant = 'default'
      else if (status.code === 'STAT-LOAN-PENDING') variant = 'secondary'
      else if (status.code === 'STAT-LOAN-REJECTED') variant = 'destructive'
      else if (status.code === 'STAT-LOAN-RETURNED') variant = 'outline'

      return h(Badge, { variant }, () => status.name)
    },
  },
  {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      const loan = row.original
      const status = metadata.value?.statuses.find(
        (s: InventoryStatus) => s.id === loan.statusId,
      )

      if (status?.code === 'STAT-LOAN-APPROVED') {
        return h(
          Button,
          {
            size: 'sm',
            variant: 'outline',
            onClick: () => openReturnDialog(loan),
          },
          () => [h(RotateCcw, { class: 'size-4 mr-1' }), 'Kembalikan'],
        )
      }
      return '-'
    },
  },
]

onMounted(() => {
  void loadData()
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
            <CardTitle class="text-2xl font-bold tracking-tight"
              >Transaksi Peminjaman</CardTitle
            >
          </div>
          <Button @click="router.push({ name: 'inventory-loans-create' })">
            <Plus class="size-4 mr-2" />
            Pinjam Aset
          </Button>
        </CardHeader>
        <CardContent class="p-6">
          <DataTable
            :columns="columns"
            :data="loans"
            :loading="loading"
          />
        </CardContent>
      </Card>
    </div>

    <!-- Return Loan Dialog -->
    <Dialog
      :open="isReturnOpen"
      @update:open="isReturnOpen = $event"
    >
      <DialogContent class="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Proses Pengembalian Aset</DialogTitle>
          <DialogDescription>
            Perbarui kondisi aset yang dikembalikan ke dalam inventaris sekolah.
          </DialogDescription>
        </DialogHeader>

        <form
          class="space-y-4 py-2"
          @submit.prevent="handleReturnLoan"
        >
          <div class="space-y-3 max-h-[250px] overflow-y-auto pr-1">
            <div
              v-for="item in returnForm.items"
              :key="item.assetId"
              class="border p-3 rounded-lg bg-card space-y-2"
            >
              <div class="text-sm font-semibold text-foreground">
                {{
                  selectedLoanForReturn?.items.find(
                    (i: any) => i.assetId === item.assetId,
                  )?.asset?.name
                }}
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div class="space-y-1">
                  <Label>Kondisi Saat Kembali</Label>
                  <select
                    v-model="item.returnedConditionId"
                    class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option
                      v-for="cond in metadata?.conditions"
                      :key="cond.id"
                      :value="cond.id"
                    >
                      {{ cond.name }}
                    </option>
                  </select>
                </div>
                <div class="space-y-1">
                  <Label>Catatan Pengembalian</Label>
                  <Input
                    v-model="item.notes"
                    placeholder="Catatan (opsional)"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter class="pt-4">
            <Button
              type="button"
              variant="outline"
              @click="isReturnOpen = false"
              >Batal</Button
            >
            <Button
              type="submit"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Memproses...' : 'Proses Kembali' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </AppLayout>
</template>
