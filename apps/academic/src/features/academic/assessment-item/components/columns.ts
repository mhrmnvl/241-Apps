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
    meta: { align: 'left' },
    cell: ({ row }) => row.original.name,
  },
  {
    id: 'type',
    header: 'Tipe',
    meta: { align: 'center' },
    cell: ({ row }) => TYPE_LABELS[row.original.type],
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
        // Only show "Nilai" when a grade handler is provided (Penilaian page).
        // On the Tugas page onGrade is undefined, so the button won't appear.
        manageLabel: actions.onGrade ? 'Nilai' : undefined,
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
