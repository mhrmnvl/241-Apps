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
import { Ban, Settings2 } from 'lucide-vue-next'
import type { Credential, CredentialStatus } from '../types'

const STATUS_LABEL: Record<CredentialStatus, string> = {
  ACTIVE: 'Aktif',
  REVOKED: 'Dicabut',
  REPLACED: 'Diganti',
}

function statusVariant(status: CredentialStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'REVOKED':
      return 'destructive'
    case 'REPLACED':
      return 'secondary'
    default:
      return 'outline'
  }
}

export function createCredentialColumns(
  onRevoke: (credential: Credential) => void,
): ColumnDef<Credential>[] {
  return [
    {
      id: 'holderName',
      header: 'Nama',
      meta: { align: 'left' },
      cell: ({ row }) =>
        h(
          'span',
          { class: 'font-medium' },
          row.original.holder.displayName ?? '—',
        ),
    },
    {
      id: 'identifier',
      header: 'Identitas',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.holder.identifier,
    },
    {
      id: 'subjectType',
      header: 'Jenis',
      meta: { align: 'center' },
      cell: ({ row }) =>
        h(Badge, { variant: 'outline' }, () =>
          row.original.subjectType === 'STUDENT' ? 'Siswa' : 'Pegawai',
        ),
    },
    {
      id: 'status',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: statusVariant(row.original.status) },
          () => STATUS_LABEL[row.original.status],
        ),
    },
    {
      id: 'actions',
      header: 'Opsi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const item = row.original
        if (item.status !== 'ACTIVE') return null

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
                      {
                        onClick: () => onRevoke(item),
                        class: 'text-destructive font-medium',
                      },
                      {
                        default: () => [
                          h(Ban, { class: 'mr-2 h-4 w-4 text-destructive' }),
                          'Cabut Kartu',
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
