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

const STATUS_VARIANT: Record<
  AttendanceStatus,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PRESENT: 'default',
  LATE: 'outline',
  SICK: 'secondary',
  EXCUSED: 'secondary',
  ABSENT: 'destructive',
}

/**
 * A student's own attendance.
 *
 * No student column: every row belongs to the person reading it. The teacher's
 * sheet needs a name on each line because it is a register of a class; this is
 * a record of one person, and repeating their name on every row would say
 * nothing.
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
    // The row's schedule carries only its time slot, so that is what is shown.
    // Naming a subject here would need a relation the read does not return,
    // and inventing one for the column is how a screen starts asking for data
    // nobody needs.
    cell: ({ row }) => row.original.schedule?.timeSlot?.name ?? 'Harian',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status
      return h(
        Badge,
        { variant: STATUS_VARIANT[status] },
        () => STATUS_LABEL[status],
      )
    },
  },
  {
    accessorKey: 'note',
    header: 'Catatan',
    cell: ({ row }) => row.original.note ?? '-',
  },
]
