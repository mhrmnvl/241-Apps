import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { BloodType } from '../types'

export const createColumns = (
  onEdit: (item: BloodType) => void,
  onDelete: (
    item: BloodType,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<BloodType>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Golongan Darah',
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
          cell: ({ row }: { row: { original: BloodType } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Golongan Darah?',
              deleteDescription: `Yakin ingin menghapus golongan darah "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
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
