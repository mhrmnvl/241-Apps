import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import { Badge } from '@/ui/badge'
import { formatEntityName } from '@/shared/utils/utils'
import type { Classroom, ClassroomColumnActions } from '../types'

export const createClassroomColumns = (
  actions: ClassroomColumnActions,
): ColumnDef<Classroom>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'displayName',
    header: 'Nama Kelas',
    meta: { align: 'center' },
    cell: ({ row }) => formatEntityName(row.original.displayName),
  },
  {
    id: 'code',
    header: 'Kode',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.code ?? '-',
  },
  {
    id: 'level',
    header: 'Tingkat',
    meta: { align: 'center' },
    cell: ({ row }) =>
      h(
        Badge,
        { variant: 'outline' },
        () =>
          row.original.grade?.name ?? row.original.classroomLevel?.name ?? '-',
      ),
  },
  {
    id: 'capacity',
    header: 'Kapasitas',
    meta: { align: 'center' },
    cell: ({ row }) => row.original.capacity,
  },
  {
    id: 'supervisor',
    header: 'Wali Kelas',
    meta: { align: 'center' },
    accessorFn: (row) =>
      row.supervisor?.user?.profile?.name ?? row.supervisor?.nip ?? '-',
    cell: ({ row }) => {
      const supervisor = row.original.supervisor
      return supervisor?.user?.profile?.name
        ? formatEntityName(supervisor.user.profile.name)
        : (supervisor?.nip ?? '-')
    },
  },
  {
    id: 'isActive',
    header: 'Status',
    meta: { align: 'center' },
    cell: ({ row }) => {
      const isActive = row.original.isActive
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
          cell: ({ row }: { row: { original: Classroom } }) => {
            const classroom = row.original
            return h(ActionCell, {
              manageLabel: 'Kelola kelas',
              hideEdit: true,
              deleteTitle: 'Hapus Kelas?',
              deleteDescription:
                'Data kelas ini akan terhapus. Hal ini juga akan memberhentikan status siswa yang ada di dalamnya secara paksa.',
              onManage: () => {
                if (actions.onManageSupervisor)
                  actions.onManageSupervisor(classroom)
              },
              onDelete: (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                if (actions.onDelete)
                  return actions.onDelete(classroom, callbacks)
              },
            })
          },
        },
      ]
    : []),
]
