import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@/ui'
import type {
  EducationalHistory,
  EducationalHistoryColumnActions,
} from '../types'

export const createEducationalHistoryColumns = (
  isStudent: boolean,
  isAdmin: boolean,
  handlers: EducationalHistoryColumnActions,
): ColumnDef<EducationalHistory>[] => {
  const baseTeacherColumns: ColumnDef<EducationalHistory>[] = [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'level',
      header: 'Jenjang',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.level,
    },
    {
      accessorKey: 'institution',
      header: 'Nama Institusi',
      cell: ({ row }) => row.original.institution,
    },
    {
      accessorKey: 'major',
      header: 'Jurusan / Bidang Studi',
      cell: ({ row }) => row.original.major ?? '-',
    },
    {
      id: 'year',
      header: 'Masa Studi',
      meta: { align: 'center' },
      cell: ({ row }) =>
        `${row.original.startYear} - ${row.original.endYear ?? 'Sekarang'}`,
    },
  ]

  const baseStudentColumns: ColumnDef<EducationalHistory>[] = [
    {
      id: 'no',
      header: 'No',
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'level',
      header: 'Tingkat',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.level,
    },
    {
      accessorKey: 'institution',
      header: 'Asal Sekolah',
      cell: ({ row }) => row.original.institution,
    },
    {
      accessorKey: 'startYear',
      header: 'Tahun Masuk',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.startYear || '-',
    },
    {
      accessorKey: 'endYear',
      header: 'Tahun Keluar',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.endYear ?? '-',
    },
    {
      accessorKey: 'status',
      header: 'Keterangan',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.status || '-',
    },
  ]

  const actionColumn: ColumnDef<EducationalHistory> = {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      const item = row.original
      return h(ActionCell, {
        deleteTitle: 'Hapus Riwayat Pendidikan?',
        deleteDescription:
          'Data riwayat pendidikan ini akan dihapus secara permanen.',
        onEdit: () => handlers.onEdit(item),
        onDelete: ({
          closeAlert,
          setLoading,
        }: {
          closeAlert: () => void
          setLoading: (v: boolean) => void
        }) => {
          handlers.onDelete(item.id, setLoading, closeAlert)
        },
      })
    },
  }

  const base = isStudent ? baseStudentColumns : baseTeacherColumns
  return isAdmin ? [...base, actionColumn] : base
}
