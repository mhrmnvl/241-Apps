import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import type { UserWithRoles } from '../types'
import UserRoleActionCell from './UserRoleActionCell.vue'

export const getColumns = (
  allRoles: { id: string; code: string; name: string }[],
): ColumnDef<UserWithRoles>[] => [
  {
    id: 'name',
    header: 'Nama',
    meta: { align: 'left' },
    cell: ({ row }) => row.original.profile?.name || '-',
  },
  {
    accessorKey: 'identifier',
    header: 'Username',
    meta: { align: 'left' },
  },
  {
    id: 'roles',
    header: 'Role',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const roles = (row.original.userRoles ?? []).map((ur) => ur.role)
      return h(
        'div',
        { class: 'flex flex-wrap gap-1.5 justify-center' },
        roles.map((role) => {
          let variant: 'default' | 'secondary' | 'outline' | 'destructive' =
            'secondary'
          let label = role.name

          if (role.code === 'ADMIN') {
            variant = 'default'
            label = 'Administrator'
          } else if (role.code === 'TEACHER') {
            variant = 'outline'
            label = 'Guru'
          } else if (role.code === 'STUDENT') {
            variant = 'secondary'
            label = 'Siswa'
          } else if (role.code === 'SUPER_ADMIN') {
            variant = 'default'
            label = 'Super Admin'
          }

          return h(
            Badge,
            { variant, class: 'text-xs font-semibold px-2 py-0.5' },
            () => label,
          )
        }),
      )
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status Akun',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>('isActive')
      return h(
        'div',
        { class: 'flex justify-center' },
        h(Badge, { variant: isActive ? 'outline' : 'destructive' }, () =>
          isActive ? 'Aktif' : 'Nonaktif',
        ),
      )
    },
  },
  {
    id: 'actions',
    header: 'Opsi',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const item = row.original
      return h(
        'div',
        { class: 'flex justify-center' },
        h(UserRoleActionCell, {
          user: item,
          allRoles,
        }),
      )
    },
  },
]
