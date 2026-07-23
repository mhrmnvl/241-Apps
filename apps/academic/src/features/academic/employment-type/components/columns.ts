import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { EmploymentType } from '../types'

export const createColumns = (
  onEdit: (item: EmploymentType) => void,
  onDelete: (
    item: EmploymentType,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<EmploymentType>[] => [
  {
    accessorKey: 'code',
    header: 'Kode Status',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'name',
    header: 'Status Kepegawaian',
    meta: { align: 'left' },
  },
  ...(showActions
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          enableHiding: false,
          cell: ({ row }: { row: { original: EmploymentType } }) => {
            const employmentType = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Status Kepegawaian?',
              deleteDescription: `Yakin ingin menghapus status kepegawaian "${employmentType.name}"? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => onEdit(employmentType),
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => onDelete(employmentType, callbacks),
            })
          },
        },
      ]
    : []),
]
