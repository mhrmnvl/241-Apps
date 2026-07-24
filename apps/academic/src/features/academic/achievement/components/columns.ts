import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@/ui'
import type { Achievement, AchievementColumnActions } from '../types'

export const createAchievementColumns = (
  isAdmin: boolean,
  handlers: AchievementColumnActions,
): ColumnDef<Achievement>[] => {
  const baseColumns: ColumnDef<Achievement>[] = [
    {
      accessorKey: 'year',
      header: 'Tahun',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.year || '-',
    },
    {
      accessorKey: 'name',
      header: 'Nama Prestasi',
      meta: { align: 'left' },
      cell: ({ row }) => row.original.name,
    },
    {
      accessorKey: 'level',
      header: 'Pencapaian',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.level,
    },
    {
      accessorKey: 'type',
      header: 'Tingkat',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.type?.name ?? '-',
    },
    {
      accessorKey: 'description',
      header: 'Keterangan Singkat',
      meta: { align: 'left' },
      cell: ({ row }) =>
        h(
          'span',
          { class: 'line-clamp-2', title: row.original.description ?? '' },
          row.original.description ?? '-',
        ),
    },
  ]

  const actionColumn: ColumnDef<Achievement> = {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      const item = row.original
      return h(ActionCell, {
        deleteTitle: 'Hapus Prestasi?',
        deleteDescription: 'Data prestasi ini akan dihapus secara permanen.',
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

  return isAdmin ? [...baseColumns, actionColumn] : baseColumns
}
