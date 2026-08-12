import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { Settings2, Trash2 } from 'lucide-vue-next'
import type { NonWorkingDay } from '../types'

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value
  }
}

export function createNonWorkingDayColumns(
  onDelete: (day: NonWorkingDay) => void,
): ColumnDef<NonWorkingDay>[] {
  return [
    {
      id: 'date',
      header: 'Tanggal',
      meta: { align: 'left' },
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      id: 'name',
      header: 'Keterangan',
      meta: { align: 'left' },
      cell: ({ row }) => row.original.name,
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const day = row.original
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
                      {
                        onClick: () => onDelete(day),
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
