import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { StudentParent, StudentParentColumnActions } from '../types'
import { getParentRelationLabel } from '../types'
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/alert-dialog'
import { MoreHorizontal, Edit, Trash } from 'lucide-vue-next'

export const createStudentParentColumns = (
  actions: StudentParentColumnActions,
): ColumnDef<StudentParent>[] => [
  {
    id: 'studentName',
    header: 'Nama Siswa',
    cell: ({ row }) => {
      const studentName = row.original.student?.user?.profile?.name ?? '-'
      return h('div', { class: 'font-medium' }, studentName)
    },
  },
  {
    id: 'parentName',
    header: 'Nama Orang Tua',
    cell: ({ row }) => {
      const parentName = row.original.parent?.name ?? '-'
      return h('div', parentName)
    },
  },
  {
    id: 'parentNik',
    header: 'NIK',
    cell: ({ row }) => {
      const parentNik = row.original.parent?.nik ?? '-'
      return h('div', parentNik)
    },
  },
  {
    id: 'relation',
    header: 'Hubungan',
    cell: ({ row }) => {
      const label = getParentRelationLabel(row.original.relation)
      return h(Badge, { variant: 'outline' }, () => label)
    },
  },
  {
    id: 'isPrimary',
    header: 'Wali Utama',
    cell: ({ row }) =>
      h(
        Badge,
        { variant: row.original.isPrimary ? 'default' : 'secondary' },
        () => (row.original.isPrimary ? 'Ya' : 'Tidak'),
      ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original

      return h(
        'div',
        { class: 'relative flex justify-end items-center gap-2' },
        [
          h(
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
                        { variant: 'ghost', class: 'w-8 h-8 p-0' },
                        {
                          default: () => [
                            h('span', { class: 'sr-only' }, 'Open menu'),
                            h(MoreHorizontal, { class: 'w-4 h-4' }),
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
                      h(DropdownMenuLabel, () => 'Aksi'),
                      h(
                        DropdownMenuItem,
                        {
                          onClick: () => actions.onEdit(item),
                        },
                        {
                          default: () => [
                            h(Edit, { class: 'w-4 h-4 mr-2' }),
                            'Edit',
                          ],
                        },
                      ),
                      h(DropdownMenuSeparator),
                      h(
                        AlertDialog,
                        {},
                        {
                          default: () => [
                            h(
                              AlertDialogTrigger,
                              { asChild: true },
                              {
                                default: () =>
                                  h(
                                    DropdownMenuItem,
                                    {
                                      class: 'text-destructive',
                                      onSelect: (e: Event) =>
                                        e.preventDefault(),
                                    },
                                    {
                                      default: () => [
                                        h(Trash, { class: 'w-4 h-4 mr-2' }),
                                        'Hapus',
                                      ],
                                    },
                                  ),
                              },
                            ),
                            h(
                              AlertDialogContent,
                              {},
                              {
                                default: () => [
                                  h(
                                    AlertDialogHeader,
                                    {},
                                    {
                                      default: () => [
                                        h(
                                          AlertDialogTitle,
                                          () => 'Apakah Anda yakin?',
                                        ),
                                        h(
                                          AlertDialogDescription,
                                          () =>
                                            'Tindakan ini tidak dapat dibatalkan. Data relasi orang tua akan dihapus secara permanen.',
                                        ),
                                      ],
                                    },
                                  ),
                                  h(
                                    AlertDialogFooter,
                                    {},
                                    {
                                      default: () => [
                                        h(
                                          AlertDialogCancel,
                                          { id: `cancel-delete-${item.id}` },
                                          () => 'Batal',
                                        ),
                                        h(
                                          AlertDialogAction,
                                          {
                                            class:
                                              'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                                            onClick: () => {
                                              const closeAlert = () =>
                                                document
                                                  .getElementById(
                                                    `cancel-delete-${item.id}`,
                                                  )
                                                  ?.click()
                                              const setLoading = () => {
                                                /* noop */
                                              }
                                              actions.onDelete(item, {
                                                setLoading,
                                                closeAlert,
                                              })
                                            },
                                          },
                                          () => 'Hapus',
                                        ),
                                      ],
                                    },
                                  ),
                                ],
                              },
                            ),
                          ],
                        },
                      ),
                    ],
                  },
                ),
              ],
            },
          ),
        ],
      )
    },
  },
]
