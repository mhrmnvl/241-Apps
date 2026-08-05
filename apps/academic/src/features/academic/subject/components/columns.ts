import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import type {
  Subject,
  SubjectColumnActions,
  SubjectTeachingAssignment,
} from '../types'

/**
 * A subject is assigned per classroom, so the same teacher usually appears
 * several times. Collapse to distinct names, preserving classroom order.
 */
function distinctTeacherNames(
  assignments: SubjectTeachingAssignment[],
): string[] {
  const names = assignments.map(
    (a) => a.teacher?.user?.profile?.name ?? a.teacher?.nip ?? null,
  )
  return [...new Set(names.filter((n): n is string => !!n))]
}

/**
 * e.g. "Budi", "Budi · Siti", "Budi · Siti +2 lainnya".
 *
 * Separated by "·" rather than a comma: Indonesian teacher names carry
 * academic titles that already contain commas ("Ahmad Aripin, S.Pd.I").
 */
function summariseTeachers(assignments: SubjectTeachingAssignment[]): string {
  const names = distinctTeacherNames(assignments)
  if (names.length === 0) return '-'
  const shown = names.slice(0, 2).join(' · ')
  const rest = names.length - 2
  return rest > 0 ? `${shown} +${rest} lainnya` : shown
}

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
    meta: { align: 'left' },
  },
  {
    id: 'teacher',
    header: 'Guru Pengampu',
    meta: { align: 'left' },
    cell: ({ row }) => {
      const assignments = row.original.teachingAssignments ?? []
      const summary = summariseTeachers(assignments)
      // The full per-class breakdown lives on the Penugasan Mengajar page;
      // the title attribute keeps it reachable without widening the column.
      const detail = assignments
        .map(
          (a) =>
            `${a.classroom?.name ?? '?'}: ${
              a.teacher?.user?.profile?.name ?? a.teacher?.nip ?? '-'
            }`,
        )
        .join('\n')
      return h('span', detail ? { title: detail } : {}, summary)
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
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
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
