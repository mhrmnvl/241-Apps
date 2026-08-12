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
import type { WorkPattern } from '../types'

export function createWorkPatternColumns(
  onEdit: (pattern: WorkPattern) => void,
  onDelete: (pattern: WorkPattern) => void,
): ColumnDef<WorkPattern>[] {
  return [
    {
      id: 'name',
      header: 'Nama Pola Kerja',
      meta: { align: 'left' },
      cell: ({ row }) => row.original.name,
    },
    {
      id: 'workingDays',
      header: 'Hari Kerja',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const count = row.original.days.filter((d) => d.isWorkingDay).length
        return `${count} hari / minggu`
      },
    },
    {
      id: 'graceMinutes',
      header: 'Toleransi',
      meta: { align: 'center' },
      cell: ({ row }) => `${row.original.graceMinutes} menit`,
    },
    {
      id: 'isDefault',
      header: 'Kategori',
      meta: { align: 'center' },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: row.original.isDefault ? 'default' : 'secondary' },
          () => (row.original.isDefault ? 'Default' : 'Khusus'),
        ),
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const pattern = row.original
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
                      { onClick: () => onEdit(pattern) },
                      {
                        default: () => [
                          h(Pencil, { class: 'mr-2 h-4 w-4' }),
                          'Ubah',
                        ],
                      },
                    ),
                    !pattern.isDefault
                      ? h(
                          DropdownMenuItem,
                          {
                            onClick: () => onDelete(pattern),
                            class: 'text-destructive font-medium',
                          },
                          {
                            default: () => [
                              h(Trash2, {
                                class: 'mr-2 h-4 w-4 text-destructive',
                              }),
                              'Hapus',
                            ],
                          },
                        )
                      : null,
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
