import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { AchievementType } from '../types'

export const createColumns = (
  onEdit: (item: AchievementType) => void,
  onDelete: (
    item: AchievementType,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<AchievementType>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Tingkat Prestasi',
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
          cell: ({ row }: { row: { original: AchievementType } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Tingkat Prestasi?',
              deleteDescription: `Yakin ingin menghapus tingkat prestasi "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
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
