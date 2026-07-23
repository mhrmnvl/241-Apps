import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { SemesterType } from '../types'

export const createColumns = (
  onEdit: (item: SemesterType) => void,
  onDelete: (
    item: SemesterType,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<SemesterType>[] => [
  {
    accessorKey: 'name',
    header: 'Tipe Semester',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    meta: { align: 'center' },
    cell: ({ row }) => {
      return row.original.isActive ? 'Aktif' : 'Tidak Aktif'
    },
  },
  ...(showActions
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          enableHiding: false,
          cell: ({ row }: { row: { original: SemesterType } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Tipe Semester?',
              deleteDescription: `Yakin ingin menghapus tipe semester "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => onEdit(item),
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => onDelete(item, callbacks),
            })
          },
        },
      ]
    : []),
]
