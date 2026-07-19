import { ActionCell } from '@/ui'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { Occupation } from '../types'

export const createColumns = (
  onEdit: (item: Occupation) => void,
  onDelete: (
    id: string,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<Occupation>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Nama Pekerjaan',
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
          cell: ({ row }: { row: { original: Occupation } }) => {
            const occupation = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Pekerjaan?',
              deleteDescription: `Yakin ingin menghapus pekerjaan "${occupation.name}"? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => onEdit(occupation),
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => onDelete(occupation.id, callbacks),
            })
          },
        },
      ]
    : []),
]
