import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { KeyRound, Settings2 } from 'lucide-vue-next'
import type { GateDevice } from '../types'

function lastSeenLabel(value?: string | null) {
  if (!value) return 'Belum pernah connect'
  const date = new Date(value)
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMinutes < 1) return 'Baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`
  const hours = Math.floor(diffMinutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function isStale(value?: string | null) {
  if (!value) return true
  const diffMinutes = (Date.now() - new Date(value).getTime()) / 60000
  return diffMinutes > 15
}

export function createDeviceColumns(
  onRotateToken: (device: GateDevice) => void,
): ColumnDef<GateDevice>[] {
  return [
    {
      id: 'name',
      header: 'Nama Gerbang',
      meta: { align: 'left' },
      cell: ({ row }) => h('span', { class: 'font-medium' }, row.original.name),
    },
    {
      id: 'location',
      header: 'Lokasi',
      meta: { align: 'left' },
      cell: ({ row }) => row.original.location ?? '—',
    },
    {
      id: 'lastSeenAt',
      header: 'Terakhir Aktif',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const stale = isStale(row.original.lastSeenAt)
        return h(
          'span',
          { class: stale ? 'text-amber-600 font-medium' : 'text-foreground' },
          lastSeenLabel(row.original.lastSeenAt),
        )
      },
    },
    {
      id: 'isActive',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: row.original.isActive ? 'default' : 'secondary' },
          () => (row.original.isActive ? 'Aktif' : 'Nonaktif'),
        ),
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const device = row.original
        return h(
          DropdownMenu,
          {},
          {
            default: () => [
              h(
                DropdownMenuTrigger,
                { asChild: true },
                {
                  default: () =>
                    h(
                      Button,
                      { variant: 'ghost', class: 'h-8 w-8 p-0' },
                      {
                        default: () => [
                          h('span', { class: 'sr-only' }, 'Buka menu'),
                          h(Settings2, { class: 'h-4 w-4' }),
                        ],
                      },
                    ),
                },
              ),
              h(
                DropdownMenuContent,
                { align: 'end' },
                {
                  default: () => [
                    h(
                      DropdownMenuItem,
                      { onClick: () => onRotateToken(device) },
                      {
                        default: () => [
                          h(KeyRound, { class: 'mr-2 h-4 w-4' }),
                          'Terbitkan Token Baru',
                        ],
                      },
                    ),
                  ],
                },
              ),
            ],
          },
        )
      },
    },
  ]
}
