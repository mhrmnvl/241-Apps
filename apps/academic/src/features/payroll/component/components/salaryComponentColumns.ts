import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { Pencil, Settings2, Trash2 } from 'lucide-vue-next'
import { COMPONENT_TYPE_LABEL, DRIVER_LABEL } from '../types'
import type { SalaryComponent } from '../types'

export function createSalaryComponentColumns(
  onEdit: (component: SalaryComponent) => void,
  onRemove: (component: SalaryComponent) => void,
): ColumnDef<SalaryComponent>[] {
  return [
    {
      id: 'code',
      header: 'Kode',
      meta: { align: 'left' },
      cell: ({ row }) =>
        h(
          'span',
          { class: 'font-mono text-sm text-muted-foreground' },
          row.original.code,
        ),
    },
    {
      id: 'name',
      header: 'Nama',
      meta: { align: 'left' },
      cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.name),
    },
    {
      id: 'type',
      header: 'Jenis',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const isDeduction = row.original.type === 'DEDUCTION'
        return h(
          Badge,
          { variant: isDeduction ? 'destructive' : 'secondary' },
          () => COMPONENT_TYPE_LABEL[row.original.type],
        )
      },
    },
    {
      id: 'driver',
      header: 'Dasar Perhitungan',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const driver = row.original.driver
        return driver ? DRIVER_LABEL[driver] : 'Tetap'
      },
    },
    {
      id: 'isActive',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: row.original.isActive ? 'default' : 'secondary' },
          () => (row.original.isActive ? 'Aktif' : 'Nonaktif'),
        ),
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const item = row.original
        return h(
          DropdownMenu,
          {},
          {
            default: () => [
              h(
                DropdownMenuTrigger,
                { asChild: true },
                {
                  default: () =>
                    h(
                      Button,
                      { variant: 'ghost', class: 'h-8 w-8 p-0' },
                      {
                        default: () => [
                          h('span', { class: 'sr-only' }, 'Buka menu'),
                          h(Settings2, { class: 'h-4 w-4' }),
                        ],
                      },
                    ),
                },
              ),
              h(
                DropdownMenuContent,
                { align: 'end' },
                {
                  default: () => [
                    h(
                      DropdownMenuItem,
                      { onClick: () => onEdit(item) },
                      {
                        default: () => [
                          h(Pencil, { class: 'mr-2 h-4 w-4' }),
                          'Ubah Komponen',
                        ],
                      },
                    ),
                    h(
                      DropdownMenuItem,
                      {
                        onClick: () => onRemove(item),
                        class: 'text-destructive font-medium',
                      },
                      {
                        default: () => [
                          h(Trash2, { class: 'mr-2 h-4 w-4 text-destructive' }),
                          'Hapus Komponen',
                        ],
                      },
                    ),
                  ],
                },
              ),
            ],
          },
        )
      },
    },
  ]
}
