import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/ui/badge'
import { DAY_STATUS_LABEL } from '../types'
import type { DailyPresence, PresenceDayStatus } from '../types'

type MyPresenceDay = Omit<DailyPresence, 'holder' | 'corrected'>

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

function day(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export const myAttendanceColumns: ColumnDef<MyPresenceDay>[] = [
  {
    id: 'date',
    header: 'Tanggal',
    meta: { align: 'left' },
    cell: ({ row }) => day(row.original.date),
    accessorFn: (row) => row.date,
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
      const status = row.original.status
      return h(
        Badge,
        { variant: STATUS_VARIANT[status] ?? 'outline' },
        () => DAY_STATUS_LABEL[status] ?? status,
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
]
