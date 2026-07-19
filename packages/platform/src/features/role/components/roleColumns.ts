import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import { ActionCell } from '@/ui'
import type { Role } from '../types'

const SYSTEM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STUDENT']

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
      const isSystem = row.getValue<boolean>('isSystem')
      const isSystemRoleCode = SYSTEM_ROLES.includes(row.original.code)
      const system = isSystem ? true : isSystemRoleCode
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
      const isSystemRoleCode = SYSTEM_ROLES.includes(role.code)
      const isSystem = role.isSystem ? true : isSystemRoleCode

      return h(ActionCell, {
        hideDelete: isSystem,
        deleteTitle: 'Hapus Role?',
        deleteDescription: `Apakah Anda yakin ingin menghapus role ${role.name}? Tindakan ini tidak dapat dibatalkan.`,
        onEdit: () => onEdit(role),
        onDelete: (payload) => onDelete(role, payload),
      })
    },
  },
]
