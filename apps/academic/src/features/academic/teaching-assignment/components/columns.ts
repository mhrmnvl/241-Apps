import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import type {
  TeachingAssignment,
  TeachingAssignmentColumnActions,
} from '../types'

export const createTeachingAssignmentColumns = (
  actions: TeachingAssignmentColumnActions,
): ColumnDef<TeachingAssignment>[] => [
  {
    id: 'teacher',
    header: 'Guru',
    cell: ({ row }) =>
      row.original.teacher?.user?.profile?.name ??
      row.original.teacher?.nip ??
      '-',
  },
  {
    id: 'subject',
    header: 'Mata Pelajaran',
    cell: ({ row }) => row.original.subject?.name ?? '-',
  },
  {
    id: 'classroom',
    header: 'Kelas',
    cell: ({ row }) => row.original.classroom?.name ?? '-',
  },
  {
    id: 'semester',
    header: 'Semester',
    cell: ({ row }) => {
      const sem = row.original.semester
      if (!sem) return '-'
      const type = sem.type === 'ODD' ? 'Ganjil' : 'Genap'
      const year = sem.academicYear?.name ?? ''
      return `${type} ${year}`.trim()
    },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: TeachingAssignment } }) => {
            const item = row.original
            return h(ActionCell, {
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Penugasan?',
              deleteDescription:
                'Data penugasan mengajar ini akan dihapus secara permanen.',
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
