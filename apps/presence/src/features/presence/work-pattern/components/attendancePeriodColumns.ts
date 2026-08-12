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
import { Lock, Settings2 } from 'lucide-vue-next'

import type { AttendancePeriodRow } from '../types'

export function createAttendancePeriodColumns(
  onClosePeriod: (month: number) => void,
): ColumnDef<AttendancePeriodRow>[] {
  return [
    {
      id: 'label',
      header: 'Bulan',
      meta: { align: 'center' },
      cell: ({ row }) =>
        h('span', { class: 'font-medium' }, row.original.label),
    },
    {
      id: 'status',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const isClosed = row.original.status === 'CLOSED'
        return h(Badge, { variant: isClosed ? 'secondary' : 'outline' }, () =>
          isClosed ? 'Ditutup' : 'Terbuka',
        )
      },
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const isClosed = row.original.status === 'CLOSED'
        if (isClosed) return null

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
                      { onClick: () => onClosePeriod(row.original.month) },
                      {
                        default: () => [
                          h(Lock, { class: 'mr-2 h-4 w-4' }),
                          'Tutup Periode',
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
