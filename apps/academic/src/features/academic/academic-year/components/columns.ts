import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import { formatEntityName } from '@/shared/utils/utils'
import type { AcademicYear, AcademicYearColumnActions } from '../types'

export const createAcademicYearColumns = (
  actions: AcademicYearColumnActions,
): ColumnDef<AcademicYear>[] => [
  {
    id: 'name',
    header: 'Tahun Ajaran',
    accessorKey: 'name',
    meta: { align: 'center' },
    cell: ({ row }) => formatEntityName(row.original.name),
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
          cell: ({ row }: { row: { original: AcademicYear } }) => {
            const academicYear = row.original
            return h(ActionCell, {
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Tahun Ajaran?',
              deleteDescription:
                'Data tahun ajaran ini akan dihapus secara permanen dan tidak dapat dikembalikan.',
              manageLabel: academicYear.isActive ? 'Nonaktifkan' : 'Aktifkan',
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(academicYear)
              },
              onManage: () => {
                if (academicYear.isActive) {
                  if (actions.onDeactivate) actions.onDeactivate(academicYear)
                } else {
                  if (actions.onActivate) actions.onActivate(academicYear)
                }
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete)
                  return actions.onDelete(academicYear, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
