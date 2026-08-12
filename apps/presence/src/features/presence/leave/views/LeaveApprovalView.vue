<script setup lang="ts">
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Textarea } from '@/ui/textarea'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/features/platform/auth'
import { createLeaveApprovalColumns } from '../components/leaveApprovalColumns'
import {
  isSaving,
  leaveService,
  loading,
  pendingRequests,
  requests,
} from '../services/leaveService'

const authStore = useAuthStore()
const statusFilter = ref<'PENDING' | 'ALL'>('PENDING')
const rejectOpen = ref(false)
const rejectTargetId = ref('')
const rejectReason = ref('')

function handleOpenReject(id: string) {
  rejectTargetId.value = id
  rejectReason.value = ''
  rejectOpen.value = true
}

async function confirmReject() {
  if (rejectReason.value.trim().length < 3) {
    toast.error('Alasan penolakan wajib diisi (minimal 3 karakter).')
    return
  }
  const ok = await leaveService.reject(
    rejectTargetId.value,
    rejectReason.value.trim(),
  )
  if (ok) {
    rejectOpen.value = false
  }
}

const tableColumns = computed(() =>
  createLeaveApprovalColumns(
    (id) => void leaveService.approve(id),
    handleOpenReject,
    isSaving.value,
    authStore.user?.id ?? null,
  ),
)

const displayedData = computed(() =>
  statusFilter.value === 'ALL' ? requests.value : pendingRequests.value,
)

onMounted(() => void leaveService.fetchRequests())
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Persetujuan Izin & Cuti
        </CardTitle>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="flex flex-wrap items-center gap-3">
          <Select v-model="statusFilter">
            <SelectTrigger class="w-[180px]">
              <SelectValue placeholder="Filter status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Menunggu Persetujuan</SelectItem>
              <SelectItem value="ALL">Semua Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable
          :columns="tableColumns"
          :data="displayedData"
          :is-loading="loading"
          item-label="persetujuan izin/cuti"
        />

        <Dialog v-model:open="rejectOpen">
          <DialogContent
            class="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden"
          >
            <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
              <DialogTitle>Tolak Pengajuan Izin / Cuti</DialogTitle>
              <DialogDescription class="sr-only" />
            </DialogHeader>

            <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div class="space-y-1">
                <Label for="reject-reason">
                  Alasan Penolakan <span class="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-reason"
                  v-model="rejectReason"
                  placeholder="Tuliskan alasan penolakan pengajuan..."
                  rows="3"
                />
              </div>
            </div>

            <DialogFooter class="px-6 py-4 border-t bg-muted/20">
              <Button
                variant="outline"
                @click="rejectOpen = false"
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                :disabled="isSaving"
                @click="confirmReject"
              >
                Tolak Pengajuan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  </div>
</template>
