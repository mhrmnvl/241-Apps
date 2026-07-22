<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
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
import { Check, X } from 'lucide-vue-next'
import type {
  ApprovalInstance,
  ApprovalStep,
  InventoryLoanItem,
} from '../types'

const breadcrumbs = [
  { title: 'Inventaris', href: '#' },
  { title: 'Daftar Persetujuan' },
]

// State
const pendingApprovals = ref<ApprovalInstance[]>([])
const loading = ref(false)
const isSubmitting = ref(false)

// Dialog states
const isActionOpen = ref(false)
const selectedApproval = ref<ApprovalInstance | null>(null)
const actionForm = ref({
  note: '',
})

async function loadApprovals() {
  loading.value = true
  try {
    const res = await inventoryApi.getPendingApprovals()
    pendingApprovals.value = res.data?.data ?? []
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(
        e,
        'Gagal memuat daftar persetujuan peminjaman.',
      ),
    )
  } finally {
    loading.value = false
  }
}

function openActionDialog(approval: ApprovalInstance) {
  selectedApproval.value = approval
  actionForm.value.note = ''
  isActionOpen.value = true
}

async function processApproval(action: 'APPROVE' | 'REJECT') {
  if (!selectedApproval.value) return
  isSubmitting.value = true
  try {
    await inventoryApi.processApproval(selectedApproval.value.id, {
      action,
      note: actionForm.value.note,
    })
    toast.success(
      action === 'APPROVE'
        ? 'Pengajuan berhasil disetujui.'
        : 'Pengajuan berhasil ditolak.',
    )
    isActionOpen.value = false
    await loadApprovals()
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memproses persetujuan.'))
  } finally {
    isSubmitting.value = false
  }
}

// Columns definition
const columns: ColumnDef<ApprovalInstance>[] = [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    id: 'loanNumber',
    header: 'No. Pinjam',
    cell: ({ row }) => row.original.details?.loanNumber ?? '-',
  },
  {
    id: 'purpose',
    header: 'Tujuan',
    cell: ({ row }) => row.original.details?.purpose ?? '-',
  },
  {
    id: 'assets',
    header: 'Aset',
    cell: ({ row }) => {
      const items = row.original.details?.items ?? []
      return items
        .map(
          (i: InventoryLoanItem) => i.unit?.asset?.name ?? i.unit?.unitNumber,
        )
        .join(', ')
    },
  },
  {
    id: 'expectedReturnDate',
    header: 'Batas Kembali',
    cell: ({ row }) => {
      const d = row.original.details?.expectedReturnDate
      return d ? new Date(d).toLocaleDateString('id-ID') : '-'
    },
  },
  {
    id: 'step',
    header: 'Tahapan Saat Ini',
    cell: ({ row }) => {
      const seq = row.original.currentStepSequence
      const step = row.original.workflow?.steps.find(
        (s: ApprovalStep) => s.stepSequence === seq,
      )
      return step ? `Step ${seq}: ${step.approverRoleId}` : `Step ${seq}`
    },
  },
  {
    id: 'actions',
    header: 'Tindakan',
    cell: ({ row }) => {
      const approval = row.original
      return h(
        Button,
        {
          size: 'sm',
          onClick: () => openActionDialog(approval),
        },
        () => 'Periksa',
      )
    },
  },
]

onMounted(() => {
  void loadApprovals()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader class="border-b px-6 py-5">
          <CardTitle class="text-2xl font-bold tracking-tight"
            >Daftar Persetujuan</CardTitle
          >
          <p class="text-sm text-muted-foreground mt-1">
            Periksa dan proses pengajuan peminjaman aset logistik sekolah sesuai
            otorisasi Anda.
          </p>
        </CardHeader>
        <CardContent class="p-6">
          <DataTable
            :columns="columns"
            :data="pendingApprovals"
            :loading="loading"
          />
        </CardContent>
      </Card>
    </div>

    <!-- Process Action Dialog -->
    <Dialog
      :open="isActionOpen"
      @update:open="isActionOpen = $event"
    >
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detail Pengajuan Peminjaman</DialogTitle>
          <DialogDescription>
            Tinjau pengajuan pinjam sebelum menyetujui atau menolak.
          </DialogDescription>
        </DialogHeader>

        <div
          v-if="selectedApproval"
          class="space-y-4 py-2 text-sm"
        >
          <!-- Request Details -->
          <div
            class="grid grid-cols-3 gap-y-2 border p-3 rounded-lg bg-muted/40"
          >
            <span class="text-muted-foreground font-medium"
              >No. Peminjaman</span
            >
            <span class="col-span-2 text-foreground font-semibold">{{
              selectedApproval.details?.loanNumber
            }}</span>

            <span class="text-muted-foreground font-medium">Tujuan</span>
            <span class="col-span-2 text-foreground">{{
              selectedApproval.details?.purpose
            }}</span>

            <span class="text-muted-foreground font-medium">Batas Kembali</span>
            <span class="col-span-2 text-foreground">
              {{
                selectedApproval.details?.expectedReturnDate
                  ? new Date(
                      selectedApproval.details.expectedReturnDate,
                    ).toLocaleDateString('id-ID')
                  : '-'
              }}
            </span>

            <span class="text-muted-foreground font-medium">Aset Diajukan</span>
            <span class="col-span-2 text-foreground">
              <ul class="list-disc pl-4 space-y-1">
                <li
                  v-for="item in selectedApproval.details?.items"
                  :key="item.id"
                >
                  {{ item.unit?.asset?.name }} ({{ item.unit?.unitNumber }})
                </li>
              </ul>
            </span>
          </div>

          <!-- Note Input -->
          <div class="space-y-1">
            <Label for="note">Catatan Keputusan</Label>
            <Input
              id="note"
              v-model="actionForm.note"
              placeholder="Tulis catatan persetujuan atau alasan penolakan..."
            />
          </div>

          <DialogFooter class="pt-4 flex sm:justify-between">
            <Button
              class="mr-auto sm:mr-0"
              type="button"
              variant="outline"
              @click="isActionOpen = false"
              >Batal</Button
            >

            <div class="flex space-x-2">
              <Button
                type="button"
                variant="destructive"
                :disabled="isSubmitting"
                @click="processApproval('REJECT')"
              >
                <X class="size-4 mr-1.5" />
                Tolak
              </Button>
              <Button
                class="bg-emerald-600 hover:bg-emerald-700 text-white"
                type="button"
                :disabled="isSubmitting"
                @click="processApproval('APPROVE')"
              >
                <Check class="size-4 mr-1.5" />
                Setujui
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  </AppLayout>
</template>
