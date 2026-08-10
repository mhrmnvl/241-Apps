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
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatPeriod, formatRupiah } from '../../shared/money'
import RecalculateComparison from '../components/RecalculateComparison.vue'
import RunWorkflowActions from '../components/RunWorkflowActions.vue'
import {
  currentRun,
  loading,
  payrollRunService,
  payslips,
} from '../services/payrollRunService'
import { RUN_KIND_LABEL, RUN_STATUS_LABEL } from '../types'

const route = useRoute()
const router = useRouter()
const runId = String(route.params.id)

function openPayslip(id: string) {
  void router.push({ name: 'PayslipDetail', params: { id } })
}

onMounted(() => void payrollRunService.fetchDetail(runId))
</script>

<template>
  <div class="space-y-6 p-4 md:p-6 lg:p-8">
    <div
      v-if="loading && !currentRun"
      class="text-muted-foreground py-12 text-center text-sm"
    >
      Memuat…
    </div>

    <template v-else-if="currentRun">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-semibold">
              {{ formatPeriod(currentRun.year, currentRun.month) }}
            </h1>
            <Badge
              :variant="
                currentRun.status === 'APPROVED' ? 'default' : 'secondary'
              "
            >
              {{ RUN_STATUS_LABEL[currentRun.status] }}
            </Badge>
            <Badge variant="outline">
              {{ RUN_KIND_LABEL[currentRun.kind] }}
            </Badge>
          </div>
          <p class="text-muted-foreground text-sm">
            Dibuat oleh {{ currentRun.createdBy.displayName ?? '—' }} ·
            pembulatan {{ currentRun.roundingRule }}
          </p>
        </div>

        <RunWorkflowActions
          :run="currentRun"
          @changed="payrollRunService.fetchDetail(runId)"
        />
      </div>

      <div class="grid gap-3 sm:grid-cols-4">
        <div class="rounded-lg border p-4">
          <p class="text-muted-foreground text-xs">Pegawai</p>
          <p class="text-lg font-semibold">
            {{ currentRun.totals.employeeCount }}
          </p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-muted-foreground text-xs">Bruto</p>
          <p class="text-lg font-semibold">
            {{ formatRupiah(currentRun.totals.gross) }}
          </p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-muted-foreground text-xs">Potongan</p>
          <p class="text-lg font-semibold">
            {{ formatRupiah(currentRun.totals.deductions) }}
          </p>
        </div>
        <div class="rounded-lg border p-4">
          <p class="text-muted-foreground text-xs">Bersih</p>
          <p class="text-lg font-semibold">
            {{ formatRupiah(currentRun.totals.net) }}
          </p>
        </div>
      </div>

      <RecalculateComparison
        v-if="currentRun.previousDraft"
        :comparison="currentRun.previousDraft"
      />

      <div>
        <h2 class="mb-2 text-sm font-medium">Slip gaji</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pegawai</TableHead>
              <TableHead>NIP</TableHead>
              <TableHead class="text-right">Bruto</TableHead>
              <TableHead class="text-right">Potongan</TableHead>
              <TableHead class="text-right">Bersih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow
              v-for="slip in payslips"
              :key="slip.id"
              class="cursor-pointer"
              @click="openPayslip(slip.id)"
            >
              <TableCell>{{ slip.employee.displayName ?? '—' }}</TableCell>
              <TableCell class="font-mono text-xs">
                {{ slip.employee.identifier }}
              </TableCell>
              <TableCell class="text-right">
                {{ formatRupiah(slip.gross) }}
              </TableCell>
              <TableCell class="text-right">
                {{ formatRupiah(slip.deductions) }}
              </TableCell>
              <TableCell class="text-right font-medium">
                {{ formatRupiah(slip.net) }}
              </TableCell>
            </TableRow>

            <TableRow v-if="payslips.length === 0">
              <TableCell
                colspan="5"
                class="text-muted-foreground py-10 text-center"
              >
                Tidak ada slip gaji pada run ini.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </template>
  </div>
</template>
