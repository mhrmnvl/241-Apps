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
import { RotateCcw, Settings2 } from 'lucide-vue-next'
import { STATUS_LABEL, STATUS_VARIANT } from '../types'
import type { LeaveRequest } from '../types'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function createMyLeaveColumns(
  onWithdraw: (id: string) => void,
): ColumnDef<LeaveRequest>[] {
  return [
    {
      id: 'leaveType',
      header: 'Jenis',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.leaveType.name,
      accessorFn: (row) => row.leaveType.name,
    },
    {
      id: 'startDate',
      header: 'Tgl Mulai',
      meta: { align: 'center' },
      cell: ({ row }) => formatDate(row.original.startDate),
    },
    {
      id: 'endDate',
      header: 'Tgl Selesai',
      meta: { align: 'center' },
      cell: ({ row }) => formatDate(row.original.endDate),
    },
    {
      id: 'workingDayCount',
      header: 'Hari Kerja',
      meta: { align: 'center' },
      cell: ({ row }) => `${row.original.workingDayCount} hari`,
    },
    {
      id: 'status',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const req = row.original
        const children = [
          h(
            Badge,
            { variant: STATUS_VARIANT[req.status] },
            () => STATUS_LABEL[req.status],
          ),
        ]
        if (req.status === 'REJECTED' && req.decisionReason) {
          children.push(
            h(
              'p',
              { class: 'text-muted-foreground mt-1 text-xs italic' },
              `"${req.decisionReason}"`,
            ),
          )
        }
        return h(
          'div',
          { class: 'flex flex-col items-center justify-center' },
          children,
        )
      },
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const req = row.original
        if (req.status !== 'PENDING') return '—'
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
                          h('span', { class: 'sr-only' }, 'Buka opsi'),
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
                      { onClick: () => onWithdraw(req.id) },
                      {
                        default: () => [
                          h(RotateCcw, {
                            class: 'mr-2 h-4 w-4 text-amber-600',
                          }),
                          'Tarik Pengajuan',
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
