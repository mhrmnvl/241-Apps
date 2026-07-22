import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import { formatEntityName } from '@/shared/utils/utils'
import type { Curricula, CurriculaColumnActions } from '../types'

export const createCurriculaColumns = (
  actions: CurriculaColumnActions,
): ColumnDef<Curricula>[] => [
  {
    id: 'name',
    header: 'Nama Kurikulum',
    accessorKey: 'name',
    cell: ({ row }) => formatEntityName(row.original.name),
  },
  {
    id: 'academicYear',
    header: 'Tahun Ajaran',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const ayName = row.original.academicYear?.name
      if (!ayName) return '-'

      return formatEntityName(ayName)
    },
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
          cell: ({ row }: { row: { original: Curricula } }) => {
            const curriculum = row.original
            return h(ActionCell, {
              viewLabel: 'Mata Pelajaran',
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Kurikulum?',
              deleteDescription:
                'Data kurikulum ini akan dihapus secara permanen dan tidak dapat dikembalikan.',
              onView: () => {
                if (actions.onView) actions.onView(curriculum)
              },
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(curriculum)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete)
                  return actions.onDelete(curriculum, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
