import type { Semester, SemesterColumnActions } from '../types'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const createSemesterColumns = (
  actions: SemesterColumnActions,
): ColumnDef<Semester>[] => [
  {
    id: 'academicYear',
    header: 'Tahun Ajaran',
    accessorFn: (row) => row.academicYear?.name ?? '-',
    meta: { align: 'center' },
  },
  {
    id: 'type',
    header: 'Semester',
    accessorKey: 'type',
    cell: ({ row }) => (row.original.type?.name === 'ODD' ? 'Ganjil' : 'Genap'),
    meta: { align: 'center' },
  },
  {
    id: 'startDate',
    header: 'Tanggal Mulai',
    accessorKey: 'startDate',
    cell: ({ row }) => formatDate(row.original.startDate),
    meta: { align: 'center' },
  },
  {
    id: 'endDate',
    header: 'Tanggal Selesai',
    accessorKey: 'endDate',
    cell: ({ row }) => formatDate(row.original.endDate),
    meta: { align: 'center' },
  },
  {
    id: 'isActive',
    header: 'Status',
    meta: { align: 'center' },
    cell: ({ row }) =>
      h(
        Badge,
        { variant: row.original.isActive ? 'default' : 'secondary' },
        () => (row.original.isActive ? 'Aktif' : 'Nonaktif'),
      ),
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Semester } }) => {
            const semester = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Semester?',
              deleteDescription:
                'Data semester ini akan dihapus secara permanen dan tidak dapat dikembalikan.',
              manageLabel: semester.isActive ? 'Nonaktifkan' : 'Aktifkan',
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(semester)
              },
              onManage: () => {
                if (semester.isActive) {
                  if (actions.onDeactivate) actions.onDeactivate(semester)
                } else {
                  if (actions.onActivate) actions.onActivate(semester)
                }
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete)
                  return actions.onDelete(semester, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
