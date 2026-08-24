import { ActionCell } from '@/ui'
import { formatEntityName } from '@/shared/utils/utils'
import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import type { SocialMediaItem, SocialMediaColumnActions } from '../types'

export const createSocialMediaColumns = (
  actions: SocialMediaColumnActions,
): ColumnDef<SocialMediaItem>[] => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: 'profileName',
    header: 'Nama',
    accessorKey: 'profileName',
  },
  {
    id: 'platformName',
    header: 'Platform',
    cell: ({ row }) => {
      const sosmeds = row.original.socialMedias || []
      if (sosmeds.length === 0) return '-'
      if (sosmeds.length === 1) return sosmeds[0].platformName
      return `${sosmeds[0].platformName} + ${sosmeds.length - 1}`
    },
  },
  {
    id: 'username',
    header: 'Username',
    cell: ({ row }) => {
      const sosmeds = row.original.socialMedias || []
      if (sosmeds.length === 0) return '-'
      if (sosmeds.length === 1) return sosmeds[0].username

      return h(
        'button',
        {
          class: 'text-blue-500 hover:underline',
          onClick: () => actions.onView?.(row.original),
        },
        'Lihat Detail',
      )
    },
  },
  {
    id: 'url',
    header: 'URL / Tautan',
    cell: ({ row }) => {
      const sosmeds = row.original.socialMedias || []
      if (sosmeds.length === 0) return '-'
      if (sosmeds.length === 1) {
        const sm = sosmeds[0]
        const url = `${sm.platformBaseUrl}${sm.username}`
        return h(
          'a',
          {
            href: url,
            target: '_blank',
            class: 'text-blue-500 hover:underline',
          },
          url,
        )
      }
      return h(
        'button',
        {
          class: 'text-blue-500 hover:underline',
          onClick: () => actions.onView?.(row.original),
        },
        'Lihat Detail',
      )
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const sosmeds = row.original.socialMedias || []
      return h(ActionCell, {
        itemName: formatEntityName(
          `Sosial Media milik ${row.original.profileName}`,
        ),
        viewLabel: 'Lihat',
        editLabel: sosmeds.length > 0 ? 'Edit' : 'Tambah',
        hideDelete: true,
        onView: actions.onView
          ? () => actions.onView!(row.original)
          : undefined,
        onEdit: actions.onEdit
          ? () => actions.onEdit!(row.original)
          : undefined,
      })
    },
  },
]
