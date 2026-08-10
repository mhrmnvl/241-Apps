<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
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
import { Plus, Trash2 } from 'lucide-vue-next'
import { onMounted, ref, watch } from 'vue'
import { DRIVER_LABEL, salaryComponentService } from '../../component'
import { formatRupiah } from '../../shared/money'
import AssignSalaryDialog from '../components/AssignSalaryDialog.vue'
import {
  currentAssignments,
  employees,
  loading,
  salaryAssignmentService,
  selectedUserId,
  supersededAssignments,
} from '../services/salaryAssignmentService'
import type { SalaryAssignment } from '../types'

const dialogOpen = ref(false)

function amountOf(assignment: SalaryAssignment) {
  return assignment.rate !== null
    ? `${formatRupiah(assignment.rate)} / satuan`
    : formatRupiah(assignment.amount)
}

async function remove(assignment: SalaryAssignment) {
  const confirmed = window.confirm(
    `Hapus penetapan "${assignment.component.name}"? Riwayat penetapan sebelumnya tetap tersimpan.`,
  )
  if (confirmed) await salaryAssignmentService.remove(assignment)
}

watch(selectedUserId, (userId) => {
  if (userId) void salaryAssignmentService.fetch(userId)
})

onMounted(async () => {
  await Promise.all([
    salaryAssignmentService.fetchEmployees(),
    salaryComponentService.fetch(),
  ])
})
</script>

<template>
  <div class="space-y-4 p-4 md:p-6 lg:p-8">
    <div class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">Gaji Pegawai</h1>
        <p class="text-muted-foreground text-sm">
          Menetapkan gaji terpisah dari menjalankan penggajian — yang menghitung
          bulan tidak menentukan siapa dibayar berapa.
        </p>
      </div>
      <Button
        :disabled="!selectedUserId"
        @click="dialogOpen = true"
      >
        <Plus class="mr-2 h-4 w-4" />
        Tetapkan
      </Button>
    </div>

    <Select v-model="selectedUserId">
      <SelectTrigger class="w-full sm:w-96">
        <SelectValue placeholder="Pilih pegawai" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="employee in employees"
          :key="employee.userId"
          :value="employee.userId"
        >
          {{ employee.name }} — {{ employee.identifier }}
        </SelectItem>
      </SelectContent>
    </Select>

    <div
      v-if="!selectedUserId"
      class="text-muted-foreground rounded-lg border border-dashed py-12 text-center text-sm"
    >
      Pilih pegawai untuk melihat komponen gajinya.
    </div>

    <template v-else>
      <div>
        <h2 class="mb-2 text-sm font-medium">Berlaku saat ini</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Komponen</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead class="text-right">Nilai</TableHead>
              <TableHead>Berlaku mulai</TableHead>
              <TableHead class="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="assignment in currentAssignments"
              :key="assignment.id"
            >
              <TableCell>
                {{ assignment.component.name }}
                <span
                  v-if="assignment.component.driver"
                  class="text-muted-foreground block text-xs"
                >
                  ×
                  {{ DRIVER_LABEL[assignment.component.driver].toLowerCase() }}
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  :variant="
                    assignment.component.type === 'DEDUCTION'
                      ? 'destructive'
                      : 'secondary'
                  "
                >
                  {{
                    assignment.component.type === 'DEDUCTION'
                      ? 'Potongan'
                      : 'Menambah'
                  }}
                </Badge>
              </TableCell>
              <TableCell class="text-right font-medium">
                {{ amountOf(assignment) }}
              </TableCell>
              <TableCell>{{ assignment.effectiveFrom.slice(0, 10) }}</TableCell>
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="remove(assignment)"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>

            <TableRow v-if="!loading && currentAssignments.length === 0">
              <TableCell
                colspan="5"
                class="text-muted-foreground py-10 text-center"
              >
                Belum ada komponen gaji. Penggajian akan menolak menghitung
                pegawai ini.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <!-- The superseded rows are what explain an old payslip's figure, so they
           are visible rather than merely retained. -->
      <div v-if="supersededAssignments.length > 0">
        <h2 class="mb-2 text-sm font-medium">Riwayat</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Komponen</TableHead>
              <TableHead class="text-right">Nilai</TableHead>
              <TableHead>Periode berlaku</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="assignment in supersededAssignments"
              :key="assignment.id"
              class="text-muted-foreground"
            >
              <TableCell>{{ assignment.component.name }}</TableCell>
              <TableCell class="text-right">
                {{ amountOf(assignment) }}
              </TableCell>
              <TableCell>
                {{ assignment.effectiveFrom.slice(0, 10) }} —
                {{ assignment.effectiveTo?.slice(0, 10) }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </template>

    <AssignSalaryDialog
      v-model:open="dialogOpen"
      :user-id="selectedUserId"
    />
  </div>
</template>
