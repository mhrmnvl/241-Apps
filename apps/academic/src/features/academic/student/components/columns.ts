import type { Student, GradeOption, StudentColumnActions } from '../types'
import { ActionCell } from '@/ui'

import { Badge } from '@/ui/badge'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

export const createColumns = (
  actions: StudentColumnActions,
  grades: GradeOption[] = [],
): ColumnDef<Student>[] => [
  {
    id: 'nis',
    header: 'NIS',
    cell: ({ row }) => row.original.nis,
    accessorKey: 'nis',
  },
  {
    id: 'nisn',
    header: 'NISN',
    cell: ({ row }) => row.original.nisn,
    accessorKey: 'nisn',
  },
  {
    id: 'name',
    header: 'Nama Lengkap',
    meta: { align: 'left' },
    cell: ({ row }) => row.original.user?.profile?.name || '-',
    accessorFn: (row) => row.user?.profile?.name,
  },
  {
    id: 'gender',
    header: 'L/P',
    meta: { align: 'center' },
    cell: ({ row }) => row.getValue<string>('gender'),
    accessorFn: (row) => {
      const gender = row.user?.profile?.gender
      if (!gender) return '-'
      const normalized = gender.toLowerCase()
      return normalized === 'male'
        ? 'L'
        : normalized === 'female'
          ? 'P'
          : gender
    },
  },
  {
    id: 'level',
    header: 'Tingkat',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const levelId =
        row.original.gradeId ??
        row.original.enrollments?.[0]?.classroom?.gradeId
      return grades.find((l) => l.id === levelId)?.name ?? '-'
    },
    accessorFn: (row) =>
      row.gradeId ?? row.enrollments?.[0]?.classroom?.gradeId ?? '',
  },
  {
    id: 'class',
    header: 'Rombel',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const enrollment = row.original.enrollments?.[0]
      return enrollment?.classroom?.code ?? '-'
    },
    accessorFn: (row) => row.enrollments?.[0]?.classroom?.code ?? '',
  },
  {
    id: 'status',
    header: 'Status',
    meta: { align: 'center' },
    accessorFn: (row) => (row.user?.isActive ? 'active' : 'inactive'),
    cell: ({ row }) => {
      const isActive = row.original.user?.isActive
      return h(Badge, { variant: isActive ? 'default' : 'secondary' }, () =>
        isActive ? 'Aktif' : 'Nonaktif',
      )
    },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Student } }) => {
            const student = row.original
            return h(ActionCell, {
              viewLabel: 'Lihat Detail',
              hideEdit: true,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Siswa?',
              deleteDescription: `Yakin ingin menghapus data siswa "${student.user?.profile?.name || ''}"? Tindakan ini tidak dapat dibatalkan.`,
              onView: () => {
                if (actions.onViewDetail) actions.onViewDetail(student)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete) {
                  return actions.onDelete(student, callbacks)
                }
              },
            })
          },
        },
      ]
    : []),
]

export const createAccountColumns = (
  actions: StudentColumnActions,
  grades: GradeOption[] = [],
): ColumnDef<Student>[] => [
  {
    id: 'name',
    header: 'Nama Lengkap',
    cell: ({ row }) => row.original.user?.profile?.name || '-',
    accessorFn: (row) => row.user?.profile?.name,
  },
  {
    id: 'identifier',
    header: 'Username',
    cell: ({ row }) => row.original.user?.identifier || '-',
    accessorFn: (row) => row.user?.identifier,
  },
  {
    id: 'level',
    header: 'Tingkat',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const levelId =
        row.original.gradeId ??
        row.original.enrollments?.[0]?.classroom?.gradeId
      return grades.find((l) => l.id === levelId)?.name ?? '-'
    },
    accessorFn: (row) =>
      row.gradeId ?? row.enrollments?.[0]?.classroom?.gradeId ?? '',
  },
  {
    id: 'class',
    header: 'Rombel',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const enrollment = row.original.enrollments?.[0]
      return enrollment?.classroom?.code ?? '-'
    },
    accessorFn: (row) => row.enrollments?.[0]?.classroom?.code ?? '',
  },
  {
    id: 'status',
    header: 'Status',
    meta: { align: 'center' },
    accessorFn: (row) => (row.user?.isActive ? 'active' : 'inactive'),
    cell: ({ row }) => {
      const isActive = row.original.user?.isActive
      return h(Badge, { variant: isActive ? 'default' : 'secondary' }, () =>
        isActive ? 'Aktif' : 'Nonaktif',
      )
    },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Student } }) => {
            const student = row.original
            const isActive = student.user?.isActive ?? false
            return h(ActionCell, {
              hideEdit: true,
              hideDelete: actions.canDelete === false,
              manageLabel: isActive ? 'Nonaktifkan' : 'Aktifkan',
              deleteTitle: 'Hapus Akun Siswa?',
              deleteDescription: `Yakin ingin menghapus akun "${student.user?.identifier || ''}" milik ${student.user?.profile?.name || ''}? Tindakan ini tidak dapat dibatalkan.`,
              onManage: () => {
                if (actions.onToggleActive)
                  actions.onToggleActive(student, !isActive)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete) {
                  return actions.onDelete(student, callbacks)
                }
              },
            })
          },
        },
      ]
    : []),
]
