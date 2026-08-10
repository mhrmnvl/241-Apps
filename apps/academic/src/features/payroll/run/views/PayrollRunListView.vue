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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Plus } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { formatPeriod, formatRupiah, MONTH_NAMES } from '../../shared/money'
import {
  isWorking,
  loading,
  payrollRunService,
  runs,
} from '../services/payrollRunService'
import { RUN_KIND_LABEL, RUN_STATUS_LABEL } from '../types'
import type { CreatePayrollRunPayload } from '../types'

const router = useRouter()
const dialogOpen = ref(false)

const now = new Date()
const form = ref<Required<CreatePayrollRunPayload>>({
  year: now.getFullYear(),
  // Payroll runs the month that just closed, not the one in progress.
  month: now.getMonth() === 0 ? 12 : now.getMonth(),
  kind: 'ORIGINAL',
  note: '',
})

async function create() {
  const run = await payrollRunService.create({
    year: Number(form.value.year),
    month: Number(form.value.month),
    kind: form.value.kind,
    note: form.value.note || undefined,
  })

  if (run) {
    dialogOpen.value = false
    await router.push({ name: 'PayrollRunDetail', params: { id: run.id } })
  }
}

onMounted(() => void payrollRunService.fetch())
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Penggajian</h1>
        <p class="text-muted-foreground text-sm">
          Perhitungan bulanan dari kehadiran yang sudah ditutup.
        </p>
      </div>
      <Button @click="dialogOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Hitung bulan
      </Button>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Periode</TableHead>
          <TableHead>Jenis</TableHead>
          <TableHead class="text-right">Pegawai</TableHead>
          <TableHead class="text-right">Total bersih</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="run in runs"
          :key="run.id"
          class="cursor-pointer"
          @click="
            router.push({ name: 'PayrollRunDetail', params: { id: run.id } })
          "
        >
          <TableCell class="font-medium">
            {{ formatPeriod(run.year, run.month) }}
            <span
              v-if="run.sequence > 1"
              class="text-muted-foreground"
            >
              #{{ run.sequence }}
            </span>
          </TableCell>
          <TableCell>{{ RUN_KIND_LABEL[run.kind] }}</TableCell>
          <TableCell class="text-right">
            {{ run.totals.employeeCount }}
          </TableCell>
          <TableCell class="text-right font-medium">
            {{ formatRupiah(run.totals.net) }}
          </TableCell>
          <TableCell>
            <Badge
              :variant="run.status === 'APPROVED' ? 'default' : 'secondary'"
            >
              {{ RUN_STATUS_LABEL[run.status] }}
            </Badge>
          </TableCell>
        </TableRow>

        <TableRow v-if="!loading && runs.length === 0">
          <TableCell
            colspan="5"
            class="text-muted-foreground py-10 text-center"
          >
            Belum ada penggajian.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hitung Penggajian</DialogTitle>
          <DialogDescription>
            Bulan yang dihitung harus sudah ditutup di Presensi — kalau belum,
            koreksi kehadiran masih bisa mengubah angkanya.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label for="run-year">Tahun</Label>
              <Input
                id="run-year"
                v-model="form.year"
                type="number"
                min="2000"
                max="2100"
              />
            </div>
            <div class="space-y-1.5">
              <Label>Bulan</Label>
              <Select v-model="form.month">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="(name, index) in MONTH_NAMES"
                    :key="name"
                    :value="index + 1"
                  >
                    {{ name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div class="space-y-1.5">
            <Label>Jenis</Label>
            <Select v-model="form.kind">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ORIGINAL">Utama</SelectItem>
                <SelectItem value="ADJUSTMENT">Penyesuaian</SelectItem>
              </SelectContent>
            </Select>
            <p class="text-muted-foreground text-xs">
              Koreksi bulan yang sudah disetujui dibuat sebagai penyesuaian.
            </p>
          </div>

          <div class="space-y-1.5">
            <Label for="run-note">Catatan (opsional)</Label>
            <Input
              id="run-note"
              v-model="form.note"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            @click="dialogOpen = false"
          >
            Batal
          </Button>
          <Button
            :disabled="isWorking"
            @click="create"
            >Hitung</Button
          >
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
