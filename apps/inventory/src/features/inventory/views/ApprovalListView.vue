<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
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
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { approvalService } from '../services/approvalService'
import type {
  ApprovalInstance,
  ApprovalStep,
  InventoryLoanItem,
} from '../types'

// State
const pendingApprovals = ref<ApprovalInstance[]>([])
const loading = ref(false)
const isSubmitting = ref(false)

// Dialog states
const isActionOpen = ref(false)
const selectedApproval = ref<ApprovalInstance | null>(null)
const actionForm = ref({
  note: '',
  forwardToNextApprover: false,
})

/**
 * The step after the one being decided, when the workflow has one.
 *
 * A mandatory next step is not a choice — the loan goes there whatever this
 * screen shows — so only an optional one becomes a question for the approver.
 */
const nextStep = computed<ApprovalStep | undefined>(() => {
  const approval = selectedApproval.value
  if (!approval) return undefined
  return approval.workflow?.steps.find(
    (s) => s.stepSequence === approval.currentStepSequence + 1,
  )
})

const canChooseToForward = computed(
  () => nextStep.value !== undefined && !nextStep.value.isMandatory,
)

async function loadApprovals() {
  loading.value = true
  try {
    pendingApprovals.value = await approvalService.listPending()
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
  actionForm.value.forwardToNextApprover = false
  isActionOpen.value = true
}

async function processApproval(action: 'APPROVE' | 'REJECT') {
  if (!selectedApproval.value) return
  isSubmitting.value = true
  try {
    const ok = await approvalService.process(
      selectedApproval.value.id,
      action,
      actionForm.value.note,
      // A rejection ends the request; forwarding it would be meaningless, and
      // the backend refuses the flag where there is nobody to forward to.
      action === 'APPROVE' && canChooseToForward.value
        ? actionForm.value.forwardToNextApprover
        : undefined,
    )
    if (ok) {
      isActionOpen.value = false
      await loadApprovals()
    }
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
      return step ? `Step ${seq}: ${step.approverRoleCode}` : `Step ${seq}`
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
        <div class="grid grid-cols-3 gap-y-2 border p-3 rounded-lg bg-muted/40">
          <span class="text-muted-foreground font-medium">No. Peminjaman</span>
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

        <!--
          Only for an optional next step. A mandatory one is taken whatever is
          shown here, so offering the choice would be a lie; nothing is shown
          when there is no next approver at all.
        -->
        <div
          v-if="canChooseToForward"
          class="flex items-start gap-3 rounded-lg border border-dashed p-3"
        >
          <Checkbox
            id="forward"
            class="mt-0.5"
            :model-value="actionForm.forwardToNextApprover"
            @update:model-value="
              actionForm.forwardToNextApprover = $event === true
            "
          />
          <div class="space-y-1">
            <Label
              for="forward"
              class="cursor-pointer"
            >
              Teruskan ke penyetuju berikutnya
            </Label>
            <p class="text-xs text-muted-foreground">
              Persetujuan Anda diteruskan ke
              {{ nextStep?.approverRoleCode }} untuk diperiksa lagi. Biarkan
              kosong bila peminjaman ini cukup disetujui oleh Anda.
            </p>
          </div>
        </div>

        <!--
          The approver should not have to remember which of the two buttons
          they are about to press means "done".
        -->
        <p
          v-else-if="nextStep"
          class="text-xs text-muted-foreground"
        >
          Peminjaman ini wajib diteruskan ke
          {{ nextStep.approverRoleCode }} setelah Anda setujui.
        </p>

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
</template>
