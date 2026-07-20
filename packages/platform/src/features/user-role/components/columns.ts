import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import type { UserWithRoles } from '../types'
import { useUserRoleStore } from '../stores/userRoleStore'
import UserRoleActionCell from './UserRoleActionCell.vue'

export const getColumns = (
  allRoles: { id: string; code: string; name: string }[],
): ColumnDef<UserWithRoles>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => {
      const store = useUserRoleStore()
      return (
        (store.paginationMeta.page - 1) * store.paginationMeta.limit +
        row.index +
        1
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'identifier',
    header: 'Username',
  },
  {
    id: 'roles',
    header: 'Role',
    cell: ({ row }) => {
      const roles = (row.original.userRoles ?? []).map((ur) => ur.role)
      return h(
        'div',
        { class: 'flex flex-wrap gap-1.5' },
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
    cell: ({ row }) => {
      const isActive = row.getValue<boolean>('isActive')
      return h(Badge, { variant: isActive ? 'outline' : 'destructive' }, () =>
        isActive ? 'Aktif' : 'Nonaktif',
      )
    },
  },
  {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      const item = row.original
      return h(UserRoleActionCell, {
        user: item,
        allRoles,
      })
    },
  },
]
