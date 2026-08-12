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
import { Eye, Settings2 } from 'lucide-vue-next'
import { formatPeriod, formatRupiah } from '../../shared/money'
import { RUN_KIND_LABEL, RUN_STATUS_LABEL } from '../types'
import type { PayrollRun } from '../types'

export function createPayrollRunColumns(
  onViewDetail: (run: PayrollRun) => void,
): ColumnDef<PayrollRun>[] {
  return [
    {
      id: 'period',
      header: 'Periode',
      meta: { align: 'left' },
      cell: ({ row }) => {
        const run = row.original
        return h('div', { class: 'font-medium' }, [
          formatPeriod(run.year, run.month),
          run.sequence > 1
            ? h(
                'span',
                { class: 'text-muted-foreground ml-1.5 text-xs' },
                `#${run.sequence}`,
              )
            : null,
        ])
      },
    },
    {
      id: 'kind',
      header: 'Jenis',
      meta: { align: 'left' },
      cell: ({ row }) => RUN_KIND_LABEL[row.original.kind],
    },
    {
      id: 'employeeCount',
      header: 'Pegawai',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.totals.employeeCount,
    },
    {
      id: 'netTotal',
      header: 'Total Bersih',
      meta: { align: 'right' },
      cell: ({ row }) =>
        h(
          'span',
          { class: 'font-medium' },
          formatRupiah(row.original.totals.net),
        ),
    },
    {
      id: 'status',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const status = row.original.status
        const variant =
          status === 'APPROVED'
            ? 'default'
            : status === 'SUBMITTED'
              ? 'outline'
              : 'secondary'
        return h(Badge, { variant }, () => RUN_STATUS_LABEL[status])
      },
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const run = row.original
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
                      { onClick: () => onViewDetail(run) },
                      {
                        default: () => [
                          h(Eye, { class: 'mr-2 h-4 w-4' }),
                          'Lihat Detail',
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
