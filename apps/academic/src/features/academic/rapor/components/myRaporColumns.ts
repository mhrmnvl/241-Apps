import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Eye } from 'lucide-vue-next'
import type { RaporData } from '../types'

/**
 * A student's own report cards.
 */
export const createMyRaporColumns = (
  onView: (rapor: RaporData) => void,
): ColumnDef<RaporData>[] => [
  {
    id: 'semester',
    header: 'Semester',
    cell: ({ row }) => {
      const semester = row.original.enrollment?.semester
      const year = semester?.academicYear?.name
      const term =
        semester?.type?.name === 'ODD'
          ? 'Ganjil'
          : semester?.type?.name === 'EVEN'
            ? 'Genap'
            : null
      return [term, year].filter(Boolean).join(' — ') || '-'
    },
  },
  {
    id: 'classroom',
    header: 'Kelas',
    cell: ({ row }) =>
      row.original.enrollment?.classroom?.displayName ??
      row.original.enrollment?.classroom?.name ??
      '-',
  },
  {
    accessorKey: 'totalAverage',
    header: 'Rata-rata',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const val = row.original.totalAverage
      return val !== null && val !== undefined
        ? h(
            'span',
            { class: 'font-semibold tabular-nums' },
            Number(val).toFixed(2),
          )
        : '-'
    },
  },
  {
    accessorKey: 'rank',
    header: 'Peringkat',
    meta: { align: 'center' },
    cell: ({ row }) =>
      row.original.rank !== null && row.original.rank !== undefined
        ? h('span', { class: 'tabular-nums' }, String(row.original.rank))
        : '-',
  },
  {
    id: 'status',
    header: 'Status',
    meta: { align: 'center' },
    cell: () =>
      h(
        Badge,
        {
          variant: 'outline',
          class:
            'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
        },
        () => 'Terbit',
      ),
  },
  {
    id: 'actions',
    header: '',
    meta: { align: 'center' },
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'ghost',
          size: 'sm',
          class: 'h-8 px-2.5 text-xs',
          onClick: () => onView(row.original),
        },
        () => [h(Eye, { class: 'size-3.5 mr-1.5' }), 'Lihat Rapor'],
      ),
  },
]
