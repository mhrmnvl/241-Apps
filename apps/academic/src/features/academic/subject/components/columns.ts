import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import type { Subject, SubjectColumnActions } from '../types'

export const createSubjectColumns = (
  actions: SubjectColumnActions,
): ColumnDef<Subject>[] => [
  {
    id: 'code',
    header: 'Kode',
    accessorKey: 'code',
    meta: { align: 'center' },
  },
  {
    id: 'name',
    header: 'Nama Mata Pelajaran',
    accessorKey: 'name',
  },
  {
    id: 'teacher',
    header: 'Guru Pengampu',
    cell: ({ row }) => {
      const teachers = row.original.teachingAssignments
      if (teachers && teachers.length > 0) {
        const firstTeacher = teachers[0]?.teacher
        return firstTeacher?.user?.profile?.name ?? firstTeacher?.nip ?? '-'
      }
      return '-'
    },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Subject } }) => {
            const subject = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Mata Pelajaran?',
              deleteDescription:
                'Data mata pelajaran ini akan dihapus secara permanen.',
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(subject)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete)
                  return actions.onDelete(subject, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
