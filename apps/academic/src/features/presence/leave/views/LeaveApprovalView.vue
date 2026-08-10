<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Check, X } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  isSaving,
  leaveService,
  loading,
  pendingRequests,
  requests,
} from '../services/leaveService'
import { STATUS_LABEL, STATUS_VARIANT } from '../types'

const showAll = ref(false)

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function reject(id: string) {
  const reason = window.prompt('Alasan penolakan')
  if (!reason) {
    toast.error('Alasan penolakan wajib diisi.')
    return
  }
  await leaveService.reject(id, reason)
}

onMounted(() => void leaveService.fetchRequests())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Persetujuan Izin & Cuti</h1>
        <p class="text-muted-foreground text-sm">
          Anda tidak dapat menyetujui pengajuan Anda sendiri. Pengajuan yang
          melebihi kuota ditolak dengan menyebutkan kekurangannya.
        </p>
      </div>
      <Button
        variant="outline"
        @click="showAll = !showAll"
      >
        {{ showAll ? 'Hanya yang menunggu' : 'Tampilkan semua' }}
      </Button>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Pemohon</TableHead>
          <TableHead>Jenis</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead class="text-right">Hari</TableHead>
          <TableHead>Alasan</TableHead>
          <TableHead class="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="request in showAll ? requests : pendingRequests"
          :key="request.id"
        >
          <TableCell>{{ request.requester.displayName ?? '—' }}</TableCell>
          <TableCell>
            {{ request.leaveType.name }}
            <!-- Working elsewhere, not leave — it must not read as absence. -->
            <Badge
              v-if="request.leaveType.treatment === 'OFFICIAL_DUTY'"
              variant="outline"
              class="ml-1"
            >
              Dinas
            </Badge>
          </TableCell>
          <TableCell>
            {{ formatDate(request.startDate) }} –
            {{ formatDate(request.endDate) }}
          </TableCell>
          <TableCell class="text-right">{{
            request.workingDayCount
          }}</TableCell>
          <TableCell class="max-w-xs truncate">{{ request.reason }}</TableCell>
          <TableCell class="space-x-1 text-right">
            <template v-if="request.status === 'PENDING'">
              <Button
                variant="ghost"
                size="sm"
                :disabled="isSaving"
                class="text-emerald-600"
                @click="leaveService.approve(request.id)"
              >
                <Check class="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                :disabled="isSaving"
                class="text-red-600"
                @click="reject(request.id)"
              >
                <X class="h-4 w-4" />
              </Button>
            </template>
            <Badge
              v-else
              :variant="STATUS_VARIANT[request.status] as 'default'"
            >
              {{ STATUS_LABEL[request.status] }}
            </Badge>
          </TableCell>
        </TableRow>

        <TableRow
          v-if="!loading && (showAll ? requests : pendingRequests).length === 0"
        >
          <TableCell
            colspan="6"
            class="text-muted-foreground py-10 text-center"
          >
            {{
              showAll
                ? 'Belum ada pengajuan.'
                : 'Tidak ada yang menunggu persetujuan.'
            }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
