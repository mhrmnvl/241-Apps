import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import { ActionCell } from '@/ui'
import type { Role } from '../types'

export const getColumns = (
  onEdit: (role: Role) => void,
  onDelete: (
    role: Role,
    payload: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ) => void,
): ColumnDef<Role>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Nama Role',
  },
  {
    accessorKey: 'code',
    header: 'Kode Role',
    cell: ({ row }) => {
      const code = row.getValue<string>('code')
      return h(Badge, { variant: 'outline' }, () => code)
    },
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => row.getValue<string>('description') ?? '-',
  },
  {
    accessorKey: 'isSystem',
    header: 'Tipe',
    cell: ({ row }) => {
      const system = row.getValue<boolean>('isSystem')
      return h(Badge, { variant: system ? 'default' : 'secondary' }, () =>
        system ? 'Sistem' : 'Kustom',
      )
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const role = row.original

      return h(ActionCell, {
        // `isSystem` is exactly what the server refuses to delete. Adding a
        // list of role codes here made the button disagree with the endpoint:
        // TEACHER was hidden in the table while `DELETE /roles/:id` still
        // accepted it, because the seed had left its flag false.
        hideDelete: role.isSystem,
        deleteTitle: 'Hapus Role?',
        deleteDescription: `Apakah Anda yakin ingin menghapus role ${role.name}? Tindakan ini tidak dapat dibatalkan.`,
        onEdit: () => onEdit(role),
        onDelete: (payload) => onDelete(role, payload),
      })
    },
  },
]
