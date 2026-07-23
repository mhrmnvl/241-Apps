import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { PositionCategory } from '../types'

export const createColumns = (
  onEdit: (item: PositionCategory) => void,
  onDelete: (
    item: PositionCategory,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<PositionCategory>[] => [
  {
    accessorKey: 'code',
    header: 'Kode Kategori',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'name',
    header: 'Nama Kategori',
    meta: { align: 'left' },
  },
  ...(showActions
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          enableHiding: false,
          cell: ({ row }: { row: { original: PositionCategory } }) => {
            const category = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Kategori Jabatan?',
              deleteDescription: `Yakin ingin menghapus kategori jabatan "${category.name}"? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => onEdit(category),
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => onDelete(category, callbacks),
            })
          },
        },
      ]
    : []),
]
