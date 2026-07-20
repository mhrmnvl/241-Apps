import type { Grade, GradeColumnActions } from '../types'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

export const createGradeColumns = (
  actions: GradeColumnActions,
): ColumnDef<Grade>[] => [
  {
    id: 'level',
    header: 'Tingkat',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.level,
    accessorKey: 'level',
  },
  {
    id: 'name',
    header: 'Nama',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.name,
    accessorKey: 'name',
  },
  {
    id: 'status',
    header: 'Status',
    meta: { align: 'center' },
    accessorFn: (row) => (row.isActive ? 'active' : 'inactive'),
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
          cell: ({ row }: { row: { original: Grade } }) => {
            const item = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Tingkat Kelas?',
              deleteDescription: `Yakin ingin menghapus tingkat "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
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
