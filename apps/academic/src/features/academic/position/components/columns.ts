import type { Position, PositionColumnActions } from '../types'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

export const createColumns = (
  actions: PositionColumnActions,
): ColumnDef<Position>[] => [
  {
    accessorKey: 'name',
    header: 'Nama Jabatan',
    cell: ({ row }) => row.original.name,
  },
  {
    id: 'category',
    header: 'Kategori',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const label = row.original.category?.name ?? '-'
      return h(Badge, { variant: 'outline' }, () => label)
    },
    accessorFn: (row) => row.category?.name,
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const isActive = row.original.isActive
      return h(Badge, { variant: isActive ? 'default' : 'secondary' }, () =>
        isActive ? 'Aktif' : 'Nonaktif',
      )
    },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Position } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Jabatan?',
              deleteDescription: `Yakin ingin menghapus jabatan "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(item)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete) {
                  return actions.onDelete(item, callbacks)
                }
              },
            })
          },
        },
      ]
    : []),
]
