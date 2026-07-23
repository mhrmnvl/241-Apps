import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { Religion } from '../types'

export const createColumns = (
  onEdit: (item: Religion) => void,
  onDelete: (
    item: Religion,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<Religion>[] => [
  {
    accessorKey: 'name',
    header: 'Nama Agama',
    meta: { align: 'left' },
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
          cell: ({ row }: { row: { original: Religion } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Agama?',
              deleteDescription: `Yakin ingin menghapus agama "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
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
