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
import { Pencil, Settings2 } from 'lucide-vue-next'
import CorrectionTrailPopover from './CorrectionTrailPopover.vue'
import { DAY_STATUS_LABEL, hasLeaveConflict, isAnomalousDay } from '../types'
import type { DailyPresence, PresenceDayStatus } from '../types'

const STATUS_VARIANT: Record<
  PresenceDayStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PRESENT: 'default',
  LATE: 'secondary',
  ABSENT: 'destructive',
  ON_LEAVE: 'outline',
  OFFICIAL_DUTY: 'outline',
  NOT_EXPECTED: 'outline',
}

function time(value: string | null) {
  return value ? new Date(value).toISOString().slice(11, 16) : '—'
}

export function createColumns(
  onCorrection: (day: DailyPresence) => void,
): ColumnDef<DailyPresence>[] {
  return [
    {
      id: 'name',
      header: 'Nama',
      meta: { align: 'left' },
      cell: ({ row }) => row.original.holder?.displayName ?? '—',
      accessorFn: (row) =>
        row.holder?.displayName ?? row.holder?.identifier ?? '',
    },
    {
      id: 'checkInAt',
      header: 'Masuk',
      meta: { align: 'center' },
      cell: ({ row }) => time(row.original.checkInAt),
    },
    {
      id: 'checkOutAt',
      header: 'Pulang',
      meta: { align: 'center' },
      cell: ({ row }) => time(row.original.checkOutAt),
    },
    {
      id: 'status',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const day = row.original
        const badges = [
          h(
            Badge,
            { variant: STATUS_VARIANT[day.status] },
            () => DAY_STATUS_LABEL[day.status],
          ),
        ]
        if (isAnomalousDay(day)) {
          badges.push(
            h(
              Badge,
              {
                variant: 'outline',
                class:
                  'border-amber-400 text-amber-700 dark:border-amber-800 dark:text-amber-300',
              },
              () => 'Anomali',
            ),
          )
        }
        if (hasLeaveConflict(day)) {
          badges.push(
            h(
              Badge,
              {
                variant: 'outline',
                class:
                  'border-purple-400 text-purple-700 dark:border-purple-800 dark:text-purple-300',
              },
              () => 'Cuti Bersamaan',
            ),
          )
        }
        return h(
          'div',
          { class: 'flex items-center justify-center gap-1.5 flex-wrap' },
          badges,
        )
      },
    },
    {
      id: 'lateMinutes',
      header: 'Terlambat',
      meta: { align: 'center' },
      cell: ({ row }) =>
        row.original.lateMinutes > 0 ? `${row.original.lateMinutes} mnt` : '—',
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const day = row.original
        const children = []
        if (day.corrected) {
          children.push(h(CorrectionTrailPopover, { recordId: day.id }))
        }
        children.push(
          h(
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
                        { onClick: () => onCorrection(day) },
                        {
                          default: () => [
                            h(Pencil, { class: 'mr-2 h-4 w-4' }),
                            'Koreksi Kehadiran',
                          ],
                        },
                      ),
                    ],
                  },
                ),
              ],
            },
          ),
        )
        return h(
          'div',
          { class: 'flex items-center justify-center space-x-1' },
          children,
        )
      },
    },
  ]
}
