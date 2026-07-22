import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Progress } from '@/ui'
import type { AttendanceRecapItem } from '../types'

export const createRecapColumns = (): ColumnDef<AttendanceRecapItem>[] => [
  {
    accessorKey: 'nis',
    header: 'NIS',
  },
  {
    accessorKey: 'studentName',
    header: 'Nama Siswa',
  },
  {
    accessorKey: 'PRESENT',
    header: 'Hadir',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'SICK',
    header: 'Sakit',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'EXCUSED',
    header: 'Izin',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'ABSENT',
    header: 'Alpha',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'LATE',
    header: 'Telat',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'total',
    header: 'Total',
    meta: { align: 'center' },
  },
  {
    id: 'percentage',
    header: 'Persentase',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const pct = row.original.percentage
      return h('div', { class: 'flex items-center gap-2 min-w-[120px]' }, [
        h(Progress, { modelValue: pct, class: 'h-1.5' }),
        h('span', { class: 'text-xs font-medium tabular-nums' }, `${pct}%`),
      ])
    },
  },
]
