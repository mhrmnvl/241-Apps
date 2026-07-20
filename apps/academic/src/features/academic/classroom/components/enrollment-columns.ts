import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { ClassroomEnrollment } from '../types'
import { Badge } from '@/ui/badge'
import { formatEntityName } from '@/shared/utils/utils'

export const baseColumns: ColumnDef<ClassroomEnrollment>[] = [
  {
    id: 'nis',
    header: 'NIS',
    accessorFn: (row) => row.student.nis,
  },
  {
    id: 'nisn',
    header: 'NISN',
    accessorFn: (row) => row.student.nisn,
  },
  {
    id: 'name',
    header: 'Nama Siswa',
    accessorFn: (row) => row.student.user.profile.name,
    cell: ({ row }) => formatEntityName(row.original.student.user.profile.name),
  },
  {
    id: 'gender',
    header: 'L/P',
    cell: ({ row }) => {
      const gender = row.original.student.user.profile.gender
      if (gender === 'MALE') return 'L'
      if (gender === 'FEMALE') return 'P'
      return '-'
    },
  },
  {
    id: 'status',
    header: 'Status',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const status = row.original.status
      const labelMap: Record<string, string> = {
        ACTIVE: 'Aktif',
        PROMOTED: 'Naik Kelas',
        REPEATED: 'Tinggal Kelas',
        TRANSFERRED: 'Pindah',
        DROPPED: 'Dikeluarkan',
        GRADUATED: 'Lulus',
      }
      const label = labelMap[status] ?? status
      const variant = status === 'ACTIVE' ? 'default' : 'secondary'
      return h(Badge, { variant }, () => label)
    },
  },
]

export const selectColumn: ColumnDef<ClassroomEnrollment> = {
  id: 'select',
  header: ({ table }) =>
    h('input', {
      type: 'checkbox',
      checked: table.getIsAllPageRowsSelected(),
      indeterminate: table.getIsSomePageRowsSelected(),
      onChange: (e: Event) =>
        table.toggleAllPageRowsSelected((e.target as HTMLInputElement).checked),
      class: 'h-4 w-4 rounded border-gray-300 cursor-pointer',
    }),
  cell: ({ row }) =>
    h('input', {
      type: 'checkbox',
      checked: row.getIsSelected(),
      onChange: (e: Event) =>
        row.toggleSelected((e.target as HTMLInputElement).checked),
      class: 'h-4 w-4 rounded border-gray-300 cursor-pointer',
    }),
  enableSorting: false,
  enableHiding: false,
}
