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
import { computed } from 'vue'
import { formatRupiah } from '../../shared/money'
import type { PreviousDraftComparison } from '../types'

const props = defineProps<{ comparison: PreviousDraftComparison }>()

/** Direction per row, so a rise and a fall are not read as the same event. */
function delta(previous: string, current: string) {
  return Number(current) - Number(previous)
}

const hasChanges = computed(() => props.comparison.changedPayslips.length > 0)
</script>

<template>
  <div class="rounded-lg border p-4">
    <h3 class="text-sm font-medium">Perubahan dari draf sebelumnya</h3>

    <p
      v-if="!hasChanges"
      class="text-muted-foreground mt-2 text-sm"
    >
      Tidak ada nilai yang berubah. Total tetap
      {{ formatRupiah(comparison.net) }}.
    </p>

    <Table
      v-else
      class="mt-3"
    >
      <TableHeader>
        <TableRow>
          <TableHead>Pegawai</TableHead>
          <TableHead class="text-right">Sebelum</TableHead>
          <TableHead class="text-right">Sesudah</TableHead>
          <TableHead class="text-right">Selisih</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="change in comparison.changedPayslips"
          :key="change.userId"
        >
          <TableCell>{{ change.displayName ?? change.userId }}</TableCell>
          <TableCell class="text-muted-foreground text-right">
            {{ formatRupiah(change.previousNet) }}
          </TableCell>
          <TableCell class="text-right font-medium">
            {{ formatRupiah(change.currentNet) }}
          </TableCell>
          <TableCell class="text-right">
            <Badge
              :variant="
                delta(change.previousNet, change.currentNet) < 0
                  ? 'destructive'
                  : 'secondary'
              "
            >
              {{ delta(change.previousNet, change.currentNet) > 0 ? '+' : ''
              }}{{ formatRupiah(delta(change.previousNet, change.currentNet)) }}
            </Badge>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>
</template>
