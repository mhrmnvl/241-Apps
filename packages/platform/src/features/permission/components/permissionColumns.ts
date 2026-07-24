import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import type { Permission } from '../types'

export const getColumns = (): ColumnDef<Permission>[] => [
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
]
