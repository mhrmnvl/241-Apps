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
import { Check, Settings2, X } from 'lucide-vue-next'
import { STATUS_LABEL, STATUS_VARIANT } from '../types'
import type { LeaveRequest } from '../types'

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function createLeaveApprovalColumns(
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
  isSaving: boolean,
  currentUserId: string | null = null,
): ColumnDef<LeaveRequest>[] {
  return [
    {
      id: 'requester',
      header: 'Pemohon',
      meta: { align: 'left' },
      cell: ({ row }) => row.original.requester.displayName ?? '—',
      accessorFn: (row) => row.requester.displayName ?? '',
    },
    {
      id: 'leaveType',
      header: 'Jenis',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const type = row.original.leaveType
        return h('div', { class: 'flex items-center justify-center gap-1.5' }, [
          h('span', type.name),
          type.treatment === 'OFFICIAL_DUTY'
            ? h(Badge, { variant: 'outline' }, () => 'Dinas')
            : null,
        ])
      },
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
      id: 'reason',
      header: 'Alasan',
      meta: { align: 'left' },
      cell: ({ row }) =>
        h(
          'span',
          { class: 'max-w-[200px] truncate block', title: row.original.reason },
          row.original.reason,
        ),
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const req = row.original
        if (req.status !== 'PENDING') {
          return h(
            Badge,
            { variant: STATUS_VARIANT[req.status] },
            () => STATUS_LABEL[req.status],
          )
        }

        // Self-approval is rejected by the backend (403). Hide the actions
        // entirely for the approver's own request to avoid a misleading UI.
        if (currentUserId && req.requesterId === currentUserId) {
          return h(
            Badge,
            { variant: 'outline', class: 'text-muted-foreground' },
            () => 'Pengajuan Anda',
          )
        }

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
                      {
                        variant: 'ghost',
                        class: 'h-8 w-8 p-0',
                        disabled: isSaving,
                      },
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
                      {
                        onClick: () => onApprove(req.id),
                        class: 'text-emerald-600 font-medium',
                      },
                      {
                        default: () => [
                          h(Check, { class: 'mr-2 h-4 w-4 text-emerald-600' }),
                          'Setujui Pengajuan',
                        ],
                      },
                    ),
                    h(
                      DropdownMenuItem,
                      {
                        onClick: () => onReject(req.id),
                        class: 'text-destructive font-medium',
                      },
                      {
                        default: () => [
                          h(X, { class: 'mr-2 h-4 w-4 text-destructive' }),
                          'Tolak Pengajuan',
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
