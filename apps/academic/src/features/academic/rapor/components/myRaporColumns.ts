import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import type { RaporData } from '../types'

/**
 * A student's own report cards.
 *
 * Its own column set rather than a filtered copy of the management one, for the
 * same reason `presence/leave` keeps `myLeaveColumns` beside
 * `leaveApprovalColumns`: the two audiences want different columns, and hiding
 * some of one set by condition is how a screen ends up serving two people
 * badly. A student needs no NIS and no name — they know who they are — and no
 * action column, because there is nothing here they may do.
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
      return [semester?.type, year].filter(Boolean).join(' — ') || '-'
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
    cell: ({ row }) => {
      const val = row.original.totalAverage
      return val !== null && val !== undefined ? Number(val).toFixed(2) : '-'
    },
  },
  {
    accessorKey: 'rank',
    header: 'Peringkat',
    cell: ({ row }) => row.original.rank ?? '-',
  },
  {
    id: 'status',
    header: 'Status',
    // Always published here — the self-service read returns nothing else — so
    // this says so rather than offering a state a student can never see.
    cell: () => h(Badge, { variant: 'default' }, () => 'Terbit'),
  },
  {
    id: 'detail',
    header: '',
    // The only action on this screen, and it reads. Opening one's own report
    // card to see its subjects is not an edit, and there is nothing else here
    // a student may do.
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'ghost',
          size: 'sm',
          onClick: () => onView(row.original),
        },
        () => 'Lihat',
      ),
  },
]
