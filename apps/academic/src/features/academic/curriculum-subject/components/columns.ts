import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import type {
  CurriculumSubject,
  CurriculumSubjectColumnActions,
} from '../types'

export const createCurriculumSubjectColumns = (
  actions: CurriculumSubjectColumnActions,
): ColumnDef<CurriculumSubject>[] => [
  {
    id: 'code',
    header: 'Kode',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.subject?.code ?? '-',
  },
  {
    id: 'subject',
    header: 'Mata Pelajaran',
    cell: ({ row }) => row.original.subject?.name ?? '-',
  },
  {
    id: 'hoursPerWeek',
    header: 'Jam/Minggu',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.hoursPerWeek,
  },
  {
    id: 'passingScore',
    header: 'KKM',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.passingScore,
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: CurriculumSubject } }) => {
            const item = row.original
            return h(ActionCell, {
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Mata Pelajaran?',
              deleteDescription:
                'Mata pelajaran ini akan dihapus dari kurikulum secara permanen.',
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(item)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete) return actions.onDelete(item, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
