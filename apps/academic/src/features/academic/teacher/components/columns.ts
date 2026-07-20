import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { Teacher, TeacherColumnActions } from '../types'
import { getPrimaryPosition, isGuru } from '../utils'

function statusBadge(isActive: boolean) {
  return h(Badge, { variant: isActive ? 'default' : 'secondary' }, () =>
    isActive ? 'Aktif' : 'Nonaktif',
  )
}

export const createColumns = (
  actions: TeacherColumnActions,
): ColumnDef<Teacher>[] => [
  {
    id: 'nik',
    header: 'NIK',
    cell: ({ row }) => row.original.user?.profile?.nik ?? '-',
    accessorFn: (row) => row.user?.profile?.nik,
  },
  {
    id: 'name',
    header: 'Nama Lengkap',
    cell: ({ row }) => row.original.user?.profile?.name ?? '-',
    accessorFn: (row) => row.user?.profile?.name,
  },
  {
    id: 'gender',
    header: 'L/P',
    meta: { align: 'center' },
    cell: ({ row }) => row.getValue<string>('gender'),
    accessorFn: (row) => {
      const g = row.user?.profile?.gender?.toLowerCase()
      return g === 'male' ? 'L' : g === 'female' ? 'P' : '-'
    },
  },
  {
    id: 'kategori',
    header: 'Kategori',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const guru = isGuru(row.original)
      return h(Badge, { variant: 'outline' }, () =>
        guru ? 'Guru' : 'Tenaga Kependidikan',
      )
    },
    accessorFn: (row) => (isGuru(row) ? 'Guru' : 'Tenaga Kependidikan'),
  },
  {
    id: 'position',
    header: 'Jabatan',
    meta: { align: 'center' },
    cell: ({ row }) => getPrimaryPosition(row.original),
    accessorFn: (row) => getPrimaryPosition(row),
  },
  {
    id: 'employmentType',
    header: 'Status Kepegawaian',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const label = row.original.employmentType?.name ?? '-'
      return h(Badge, { variant: 'outline' }, () => label)
    },
    accessorFn: (row) => row.employmentType?.name,
  },
  {
    id: 'status',
    header: 'Status',
    meta: { align: 'center' },
    accessorFn: (row) => (row.user?.isActive ? 'active' : 'inactive'),
    cell: ({ row }) => statusBadge(row.original.user?.isActive),
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Teacher } }) => {
            const teacher = row.original
            return h(ActionCell, {
              viewLabel: 'Lihat Detail',
              editLabel: 'Edit Data',
              deleteTitle: 'Hapus Guru?',
              deleteDescription: `Yakin ingin menghapus data guru "${teacher.user?.profile?.name || ''}"? Tindakan ini tidak dapat dibatalkan.`,
              onView: () => {
                if (actions.onViewDetail) actions.onViewDetail(teacher)
              },
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(teacher)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete)
                  return actions.onDelete(teacher, callbacks)
              },
            })
          },
        },
      ]
    : []),
]

export const createAccountColumns = (
  actions: TeacherColumnActions,
): ColumnDef<Teacher>[] => [
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
    id: 'position',
    header: 'Jabatan Utama',
    meta: { align: 'center' },
    cell: ({ row }) => getPrimaryPosition(row.original),
    accessorFn: (row) => getPrimaryPosition(row),
  },
  {
    id: 'status',
    header: 'Status Akun',
    meta: { align: 'center' },
    accessorFn: (row) => (row.user?.isActive ? 'active' : 'inactive'),
    cell: ({ row }) => statusBadge(row.original.user?.isActive),
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Teacher } }) => {
            const teacher = row.original
            return h(ActionCell, {
              deleteTitle: 'Hapus Akun Guru?',
              deleteDescription: `Yakin ingin menghapus akun "${teacher.user?.identifier || ''}"? Tindakan ini tidak dapat dibatalkan.`,
              onEdit: () => {
                if (actions.onEdit) actions.onEdit(teacher)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete)
                  return actions.onDelete(teacher, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
