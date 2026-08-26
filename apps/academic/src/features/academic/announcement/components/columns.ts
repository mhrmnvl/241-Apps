import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { ActionCell } from '@/ui'
import type { Announcement, AnnouncementColumnActions } from '../types'

export const createAnnouncementColumns = (
  actions: AnnouncementColumnActions,
): ColumnDef<Announcement>[] => [
  {
    id: 'title',
    header: 'Judul',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.title),
  },
  {
    id: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => {
      const desc = row.original.description ?? ''
      return h(
        'div',
        { class: 'max-w-[300px] truncate text-muted-foreground' },
        desc,
      )
    },
  },
  {
    id: 'date',
    header: 'Tanggal',
    cell: ({ row }) => {
      const d = new Date(row.original.date)
      return h(
        'div',
        d.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      )
    },
  },
  {
    id: 'classrooms',
    header: 'Target Kelas',
    cell: ({ row }) => {
      const classrooms = row.original.classrooms
      if (!classrooms || classrooms.length === 0) {
        return h('span', { class: 'text-muted-foreground' }, 'Semua Kelas')
      }
      // The code is what the school calls a class, and what every other
      // class picker in the app shows.
      const names = classrooms
        .map((c) => c.classroom?.code ?? c.classroom?.name)
        .filter(Boolean)
        .join(', ')
      return h('span', names || '-')
    },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: Announcement } }) => {
            const item = row.original
            return h(ActionCell, {
              // First in the menu, and offered to everyone: reading a notice
              // in full is not a management action, and the row truncates it.
              viewLabel: actions.onPreview ? 'Detail' : undefined,
              onView: () => {
                if (actions.onPreview) actions.onPreview(item)
              },
              hideEdit: actions.canUpdate === false,
              hideDelete: actions.canDelete === false,
              deleteTitle: 'Hapus Pengumuman?',
              deleteDescription:
                'Pengumuman ini akan dihapus secara permanen dari sistem.',
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
