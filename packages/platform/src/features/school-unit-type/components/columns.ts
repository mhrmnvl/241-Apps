import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { SchoolUnitType } from '../types'

export const createColumns = (
  onEdit: (item: SchoolUnitType) => void,
  onDelete: (
    item: SchoolUnitType,
    callbacks: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
  showActions = true,
): ColumnDef<SchoolUnitType>[] => [
  {
    accessorKey: 'code',
    header: 'Kode Tipe Sekolah',
    meta: { align: 'center' },
  },
  {
    accessorKey: 'name',
    header: 'Nama Tipe Sekolah',
    meta: { align: 'left' },
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
  ...(showActions
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          enableHiding: false,
          cell: ({ row }: { row: { original: SchoolUnitType } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Tipe Sekolah?',
              deleteDescription: `Yakin ingin menghapus tipe sekolah "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
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
