import type { ColumnDef } from '@tanstack/vue-table'
import type { AttendanceRecapItem } from '../types'

export const createRecapColumns = (): ColumnDef<AttendanceRecapItem>[] => [
  {
    accessorKey: 'nis',
    header: 'NIS',
  },
  {
    accessorKey: 'studentName',
    header: 'Nama Siswa',
  },
  {
    accessorKey: 'PRESENT',
    header: 'Hadir',
  },
  {
    accessorKey: 'SICK',
    header: 'Sakit',
  },
  {
    accessorKey: 'EXCUSED',
    header: 'Izin',
  },
  {
    accessorKey: 'ABSENT',
    header: 'Alpha',
  },
  {
    accessorKey: 'LATE',
    header: 'Telat',
  },
]
