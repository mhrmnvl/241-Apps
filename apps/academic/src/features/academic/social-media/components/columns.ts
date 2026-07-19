import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { ActionCell } from '@/ui'
import type { SocialMedia } from '../types'
import { socialMediaService } from '../services/socialMediaService'
import { useSocialMediaStore } from '../stores/socialMediaStore'

export const getColumns = (showActions = true): ColumnDef<SocialMedia>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => {
      const store = useSocialMediaStore()
      return (
        (store.paginationMeta.page - 1) * store.paginationMeta.limit +
        row.index +
        1
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: 'Nama SocialMedia',
  },
  {
    accessorKey: 'baseUrl',
    header: 'Base URL',
    cell: ({ row }) => {
      const url = row.getValue<string>('baseUrl')
      return h(
        'a',
        { href: url, target: '_blank', class: 'text-blue-600 hover:underline' },
        url,
      )
    },
  },
  ...(showActions
    ? [
        {
          id: 'actions',
          header: 'Opsi',
          cell: ({ row }: { row: { original: SocialMedia } }) => {
            const item = row.original
            const store = useSocialMediaStore()
            return h(ActionCell, {
              deleteTitle: 'Hapus SocialMedia?',
              deleteDescription:
                'Data socialMedia sosial media ini akan dihapus secara permanen dan tidak dapat dikembalikan.',
              onEdit: () => {
                store.openForm(item)
              },
              onDelete: async (callbacks: {
                closeAlert: () => void
                setLoading: (v: boolean) => void
              }) => {
                callbacks.setLoading(true)
                try {
                  await socialMediaService.handleDelete(item.id)
                  callbacks.closeAlert()
                } finally {
                  callbacks.setLoading(false)
                }
              },
            })
          },
        },
      ]
    : []),
]
