<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Textarea } from '@/ui/textarea'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import {
  balances,
  leaveService,
  loading,
  myRequests,
  types,
} from '../services/leaveService'
import { STATUS_LABEL, STATUS_VARIANT } from '../types'

const open = ref(false)
const leaveTypeId = ref('')
const startDate = ref('')
const endDate = ref('')
const reason = ref('')

const employeeTypes = computed(() =>
  types.value.filter((type) => type.appliesTo === 'EMPLOYEE'),
)

const selectedType = computed(() =>
  employeeTypes.value.find((type) => type.id === leaveTypeId.value),
)

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

async function submit() {
  if (!leaveTypeId.value || !startDate.value || !endDate.value) {
    toast.error('Lengkapi jenis izin dan tanggalnya.')
    return
  }
  if (reason.value.trim().length < 3) {
    toast.error('Alasan wajib diisi.')
    return
  }

  const ok = await leaveService.submit({
    leaveTypeId: leaveTypeId.value,
    startDate: startDate.value,
    endDate: endDate.value,
    reason: reason.value.trim(),
  })

  if (ok) {
    open.value = false
    leaveTypeId.value = ''
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
  }
}

onMounted(() => {
  void leaveService.fetchTypes()
  void leaveService.fetchMine()
})
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Izin & Cuti Saya</h1>
        <p class="text-muted-foreground text-sm">
          Hanya hari kerja yang dihitung — akhir pekan dan hari libur di dalam
          rentang tidak memakai kuota.
        </p>
      </div>
      <Button @click="open = true">
        <Plus class="mr-2 h-4 w-4" />
        Ajukan
      </Button>
    </div>

    <div
      v-if="balances.length > 0"
      class="grid gap-3 sm:grid-cols-3"
    >
      <div
        v-for="balance in balances"
        :key="balance.leaveTypeId"
        class="rounded-lg border p-4"
      >
        <p class="text-muted-foreground text-xs">{{ balance.name }}</p>
        <p class="text-2xl font-semibold">
          {{ balance.remaining }}
          <span class="text-muted-foreground text-sm font-normal">
            / {{ balance.quota }} hari
          </span>
        </p>
        <p class="text-muted-foreground text-xs">
          {{ balance.used }} terpakai tahun {{ balance.year }}
        </p>
      </div>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Jenis</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead class="text-right">Hari kerja</TableHead>
          <TableHead>Status</TableHead>
          <TableHead class="text-right">Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="request in myRequests"
          :key="request.id"
        >
          <TableCell>{{ request.leaveType.name }}</TableCell>
          <TableCell>
            {{ formatDate(request.startDate) }} –
            {{ formatDate(request.endDate) }}
          </TableCell>
          <TableCell class="text-right">
            {{ request.workingDayCount }}
          </TableCell>
          <TableCell>
            <Badge :variant="STATUS_VARIANT[request.status] as 'default'">
              {{ STATUS_LABEL[request.status] }}
            </Badge>
            <!-- FR-031: the requester is told why, not just that it failed. -->
            <p
              v-if="request.status === 'REJECTED' && request.decisionReason"
              class="text-muted-foreground mt-1 text-xs italic"
            >
              "{{ request.decisionReason }}"
            </p>
          </TableCell>
          <TableCell class="text-right">
            <Button
              v-if="request.status === 'PENDING'"
              variant="ghost"
              size="sm"
              @click="leaveService.withdraw(request.id)"
            >
              Tarik
            </Button>
          </TableCell>
        </TableRow>

        <TableRow v-if="!loading && myRequests.length === 0">
          <TableCell
            colspan="5"
            class="text-muted-foreground py-10 text-center"
          >
            Belum ada pengajuan.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <Dialog v-model:open="open">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajukan Izin / Cuti</DialogTitle>
          <DialogDescription>
            Hari kerja dihitung saat pengajuan dan disimpan — perubahan kalender
            setelahnya tidak akan mengubah pengajuan yang sudah disetujui.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div class="space-y-1">
            <Label for="leave-type">Jenis</Label>
            <select
              id="leave-type"
              v-model="leaveTypeId"
              class="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
            >
              <option value="">Pilih jenis…</option>
              <option
                v-for="type in employeeTypes"
                :key="type.id"
                :value="type.id"
              >
                {{ type.name }}
              </option>
            </select>
            <p
              v-if="selectedType?.requiresDocument"
              class="text-xs text-amber-600"
            >
              Jenis ini memerlukan surat pendukung.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <Label for="leave-start">Mulai</Label>
              <Input
                id="leave-start"
                v-model="startDate"
                type="date"
              />
            </div>
            <div class="space-y-1">
              <Label for="leave-end">Sampai</Label>
              <Input
                id="leave-end"
                v-model="endDate"
                type="date"
              />
            </div>
          </div>

          <div class="space-y-1">
            <Label for="leave-reason">Alasan</Label>
            <Textarea
              id="leave-reason"
              v-model="reason"
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="open = false"
            >Batal</Button
          >
          <Button @click="submit">Kirim</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
