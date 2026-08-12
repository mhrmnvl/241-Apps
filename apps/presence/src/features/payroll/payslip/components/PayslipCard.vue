<script setup lang="ts">
import { Badge } from '@/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { formatCount, formatPeriod, formatRupiah } from '../../shared/money'
import { ATTENDANCE_LABEL } from '../types'
import type { Payslip } from '../types'

defineProps<{ payslip: Payslip }>()
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-lg font-semibold">
          Slip Gaji {{ formatPeriod(payslip.run.year, payslip.run.month) }}
        </h1>
        <p class="text-muted-foreground text-sm">
          {{ payslip.employee.displayName ?? '—' }} ·
          {{ payslip.employee.identifier }}
        </p>
      </div>
      <Badge
        :variant="payslip.run.status === 'APPROVED' ? 'default' : 'secondary'"
      >
        {{ payslip.run.status === 'APPROVED' ? 'Disetujui' : 'Belum final' }}
      </Badge>
    </div>

    <div>
      <h2 class="mb-2 text-sm font-medium">Kehadiran bulan ini</h2>
      <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div
          v-for="(label, key) in ATTENDANCE_LABEL"
          :key="key"
          class="rounded-lg border p-3"
        >
          <p class="text-muted-foreground text-xs">{{ label }}</p>
          <p class="font-semibold">
            {{ formatCount(payslip.attendance[key]) }}
          </p>
        </div>
      </div>
      <p class="text-muted-foreground mt-2 text-xs">
        Angka ini yang dipakai saat perhitungan — koreksi kehadiran setelahnya
        tidak mengubah slip yang sudah disetujui.
      </p>
    </div>

    <div>
      <h2 class="mb-2 text-sm font-medium">Rincian</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Komponen</TableHead>
            <TableHead>Perhitungan</TableHead>
            <TableHead class="text-right">Jumlah</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="line in payslip.lines"
            :key="line.componentCode"
          >
            <TableCell>
              {{ line.componentName }}
              <Badge
                v-if="line.componentType === 'DEDUCTION'"
                variant="destructive"
                class="ml-2"
              >
                Potongan
              </Badge>
            </TableCell>
            <!-- FR-045: a driven amount shows the count and the rate behind
                 it, so the figure can be checked rather than trusted. -->
            <TableCell class="text-muted-foreground text-sm">
              <template v-if="line.driverCount !== null">
                {{ formatCount(line.driverCount) }} ×
                {{ formatRupiah(line.rate) }}
              </template>
              <template v-else>Tetap</template>
            </TableCell>
            <TableCell class="text-right font-medium">
              {{ line.componentType === 'DEDUCTION' ? '−' : ''
              }}{{ formatRupiah(line.amount) }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="space-y-1 rounded-lg border p-4">
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Bruto</span>
        <span>{{ formatRupiah(payslip.gross) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-muted-foreground">Potongan</span>
        <span>− {{ formatRupiah(payslip.deductions) }}</span>
      </div>
      <div class="flex justify-between border-t pt-2 font-semibold">
        <span>Diterima</span>
        <span>{{ formatRupiah(payslip.net) }}</span>
      </div>
    </div>
  </div>
</template>
