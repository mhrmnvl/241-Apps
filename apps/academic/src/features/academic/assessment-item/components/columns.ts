import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import type { AssessmentItem, AssessmentItemColumnActions } from '../types'

const TYPE_LABELS: Record<AssessmentItem['type'], string> = {
  DAILY: 'Harian',
  ASSIGNMENT: 'Tugas',
  PRACTICAL: 'Praktikum',
  MIDTERM: 'UTS',
  FINAL: 'UAS',
}

export const createAssessmentItemColumns = (
  actions: AssessmentItemColumnActions,
): ColumnDef<AssessmentItem>[] => [
  {
    id: 'name',
    header: 'Nama Tugas',
    cell: ({ row }) => row.original.name,
  },
  {
    id: 'type',
    header: 'Tipe',
    meta: { align: 'center' },
    cell: ({ row }) =>
      h(
        'span',
        {
          class:
            'inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10',
        },
        TYPE_LABELS[row.original.type],
      ),
  },
  {
    id: 'weight',
    header: 'Bobot',
    meta: { align: 'center' },
    cell: ({ row }) => `${row.original.weight}%`,
  },
  {
    id: 'maxScore',
    header: 'Skor Maks',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.maxScore,
  },
  {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      const item = row.original
      return h(ActionCell, {
        editLabel: 'Ubah',
        manageLabel: 'Nilai',
        hideEdit: actions.canUpdate === false,
        hideDelete: actions.canDelete === false,
        deleteTitle: 'Hapus Tugas?',
        deleteDescription:
          'Tugas ini beserta nilai siswa yang terkait akan dihapus secara permanen.',
        onEdit: () => {
          if (actions.onEdit) actions.onEdit(item)
        },
        onManage: () => {
          if (actions.onGrade) actions.onGrade(item)
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
