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
import { Pencil, Settings2, Trash2 } from 'lucide-vue-next'
import { APPLIES_TO_LABEL, TREATMENT_LABEL } from '../types'
import type { LeaveType } from '../types'

export function createLeaveTypeColumns(
  onEdit: (type: LeaveType) => void,
  onDelete: (type: LeaveType) => void,
): ColumnDef<LeaveType>[] {
  return [
    {
      id: 'name',
      header: 'Nama',
      meta: { align: 'left' },
      cell: ({ row }) => row.original.name,
    },
    {
      id: 'treatment',
      header: 'Perlakuan',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const treatment = row.original.treatment
        return h(
          Badge,
          {
            variant: treatment === 'OFFICIAL_DUTY' ? 'outline' : 'secondary',
          },
          () => TREATMENT_LABEL[treatment],
        )
      },
    },
    {
      id: 'appliesTo',
      header: 'Berlaku Untuk',
      meta: { align: 'center' },
      cell: ({ row }) => APPLIES_TO_LABEL[row.original.appliesTo],
    },
    {
      id: 'requiresDocument',
      header: 'Surat Pendukung',
      meta: { align: 'center' },
      cell: ({ row }) =>
        h(
          Badge,
          { variant: row.original.requiresDocument ? 'default' : 'outline' },
          () => (row.original.requiresDocument ? 'Wajib' : 'Tidak'),
        ),
    },
    {
      id: 'consumesQuota',
      header: 'Kuota',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const type = row.original
        return type.consumesQuota ? `${type.annualQuota ?? 0} hari` : '—'
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
        const type = row.original
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
                      { onClick: () => onEdit(type) },
                      {
                        default: () => [
                          h(Pencil, { class: 'mr-2 h-4 w-4' }),
                          'Ubah',
                        ],
                      },
                    ),
                    h(
                      DropdownMenuItem,
                      {
                        onClick: () => onDelete(type),
                        class: 'text-destructive font-medium',
                      },
                      {
                        default: () => [
                          h(Trash2, { class: 'mr-2 h-4 w-4 text-destructive' }),
                          'Hapus',
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
