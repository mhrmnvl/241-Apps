import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import { ActionCell } from '@/ui'
import type { Permission } from '../types'

export const getColumns = (
  onEdit: (permission: Permission) => void,
  onDelete: (
    permission: Permission,
    payload: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
): ColumnDef<Permission>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'module',
    header: 'Modul',
    cell: ({ row }) =>
      h(Badge, { variant: 'secondary' }, () => row.getValue<string>('module')),
  },
  {
    accessorKey: 'code',
    header: 'Kode',
    cell: ({ row }) =>
      h(Badge, { variant: 'outline', class: 'font-mono' }, () =>
        row.getValue<string>('code'),
      ),
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => row.getValue<string>('description') ?? '-',
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const permission = row.original
      return h(ActionCell, {
        deleteTitle: 'Hapus Permission?',
        deleteDescription: `Hapus permission "${permission.code}"? Role yang memakainya akan kehilangan hak akses ini. Tindakan ini tidak dapat dibatalkan.`,
        onEdit: () => onEdit(permission),
        onDelete: (payload) => onDelete(permission, payload),
      })
    },
  },
]
