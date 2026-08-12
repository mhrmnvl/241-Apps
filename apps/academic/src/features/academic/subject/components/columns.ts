import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import type { Subject, SubjectColumnActions } from '../types'

export const createSubjectColumns = (
  actions: SubjectColumnActions,
): ColumnDef<Subject>[] => [
  {
    id: 'code',
    header: 'Kode',
    accessorKey: 'code',
    meta: { align: 'center' },
  },
  {
    id: 'name',
    header: 'Nama Mata Pelajaran',
    accessorKey: 'name',
    meta: { align: 'left' },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Subject } }) => {
            const subject = row.original
            return h(ActionCell, {
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Mata Pelajaran?',
              deleteDescription:
                'Data mata pelajaran ini akan dihapus secara permanen.',
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(subject)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete)
                  return actions.onDelete(subject, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
