import type { ColumnDef } from '@tanstack/vue-table'
import type { MyDashboardLesson } from '../types'

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

/**
 * Accepts a `todayDate` so the column can show what day/date "hari ini" is.
 * The date string comes from the dashboard payload (`today.date`).
 */
export function createTodayLessonColumns(
  todayDate?: string,
): ColumnDef<MyDashboardLesson>[] {
  const d = todayDate ? new Date(todayDate) : new Date()
  const dayLabel = HARI[d.getDay()] ?? ''
  const dateLabel = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return [
    {
      id: 'dayDate',
      header: 'Hari, Tanggal',
      meta: { align: 'left' },
      cell: () => `${dayLabel}, ${dateLabel}`,
    },
    {
      id: 'time',
      header: 'Waktu',
      meta: { align: 'center' },
      cell: ({ row }) => `${row.original.startTime} - ${row.original.endTime}`,
    },
    {
      id: 'subjectName',
      accessorKey: 'subjectName',
      header: 'Mata Pelajaran',
      meta: { align: 'left' },
    },
    {
      id: 'classroomCode',
      accessorKey: 'classroomCode',
      header: 'Kelas',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.classroomCode ?? '-',
    },
  ]
}
