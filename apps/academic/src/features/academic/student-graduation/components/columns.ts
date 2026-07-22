import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import type {
  StudentGraduation,
  StudentGraduationColumnActions,
} from '../types'

export const createStudentGraduationColumns = (
  actions: StudentGraduationColumnActions,
): ColumnDef<StudentGraduation>[] => [
  {
    id: 'nis',
    header: 'NIS',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.student?.nis ?? '-',
  },
  {
    id: 'nisn',
    header: 'NISN',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.student?.nisn ?? '-',
  },
  {
    id: 'studentName',
    header: 'Nama Siswa',
    cell: ({ row }) => row.original.student?.user?.profile?.name ?? '-',
    filterFn: (row, _columnId, filterValue: string) => {
      const name = row.original.student?.user?.profile?.name ?? ''
      return name.toLowerCase().includes(filterValue.toLowerCase())
    },
  },
  {
    id: 'academicYear',
    header: 'Tahun Ajaran',
    cell: ({ row }) => row.original.academicYear?.name ?? '-',
  },
  {
    id: 'graduationDate',
    header: 'Tanggal Lulus',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const date = row.original.graduationDate
      if (!date) return '-'
      return new Date(date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    },
  },
  {
    id: 'certificateNo',
    header: 'No. Ijazah',
    cell: ({ row }) => row.original.certificateNo ?? '-',
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: StudentGraduation } }) => {
            const item = row.original
            return h(ActionCell, {
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Data Kelulusan?',
              deleteDescription:
                'Data kelulusan ini akan dihapus secara permanen. Status siswa TIDAK akan dikembalikan otomatis.',
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(item)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete) return actions.onDelete(item, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
