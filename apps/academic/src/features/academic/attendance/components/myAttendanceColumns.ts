import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/ui/badge'
import type { Attendance, AttendanceStatus } from '../types'

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: 'Hadir',
  LATE: 'Terlambat',
  SICK: 'Sakit',
  EXCUSED: 'Izin',
  ABSENT: 'Alpa',
}

const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    class?: string
  }
> = {
  PRESENT: {
    variant: 'outline',
    class:
      'border-emerald-500/30 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  },
  LATE: {
    variant: 'outline',
    class:
      'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  },
  SICK: {
    variant: 'outline',
    class:
      'border-blue-500/30 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  },
  EXCUSED: {
    variant: 'outline',
    class:
      'border-violet-500/30 bg-violet-50 text-violet-700 dark:bg-violet-950/30 dark:text-violet-400',
  },
  ABSENT: {
    variant: 'outline',
    class:
      'border-red-500/30 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  },
}

/**
 * A student's own attendance columns.
 */
export const myAttendanceColumns: ColumnDef<Attendance>[] = [
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: ({ row }) => {
      const raw = row.original.date
      if (!raw) return '-'
      return new Date(raw).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },
  },
  {
    id: 'timeSlot',
    header: 'Jam',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.schedule?.timeSlot?.name ?? 'Harian',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const status = row.original.status
      const config = STATUS_CONFIG[status] ?? {
        variant: 'secondary' as const,
      }
      return h(
        Badge,
        {
          variant: config.variant,
          class: config.class,
        },
        () => STATUS_LABEL[status] ?? status,
      )
    },
  },
  {
    accessorKey: 'note',
    header: 'Catatan',
    cell: ({ row }) => row.original.note || '-',
  },
]
