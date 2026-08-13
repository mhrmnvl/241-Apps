import { h } from 'vue'
import { RouterLink } from 'vue-router'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@/ui'
import type { Achievement, AchievementColumnActions } from '../types'

/**
 * `showPerson` is for the school-wide list only. On the profile tab the person
 * is the page, so naming them in every row would be noise — which is why this
 * is opt-in rather than the default.
 */
export const createAchievementColumns = (
  isAdmin: boolean,
  handlers: AchievementColumnActions,
  options: { showPerson?: boolean } = {},
): ColumnDef<Achievement>[] => {
  const personColumn: ColumnDef<Achievement> = {
    id: 'person',
    header: 'Siswa',
    meta: { align: 'left' },
    cell: ({ row }) => {
      const profile = row.original.profile
      if (!profile) return '-'
      // Links to the profile, which is where an achievement is added: the
      // dialog needs a profileId, and on this screen there is no one person.
      return h(
        RouterLink,
        {
          to: `/profile/STUDENT/${profile.userId}`,
          class: 'font-medium text-primary hover:underline',
        },
        () => profile.name,
      )
    },
  }

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

  const columns = options.showPerson
    ? [personColumn, ...baseColumns]
    : baseColumns

  return isAdmin ? [...columns, actionColumn] : columns
}
