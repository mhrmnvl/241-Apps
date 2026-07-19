import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { EventData, EventColumnActions } from '../types'

import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
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

export const createEventColumns = (
  actions: EventColumnActions,
): ColumnDef<EventData>[] => [
  ...(actions.showActions !== false
    ? [
        {
          id: 'select',
          header: ({
            table,
          }: {
            table: {
              getIsAllPageRowsSelected: () => boolean
              getIsSomePageRowsSelected: () => boolean
              toggleAllPageRowsSelected: (v: boolean) => void
            }
          }) =>
            h(Checkbox, {
              checked:
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate'),
              'onUpdate:checked': (value: boolean) =>
                table.toggleAllPageRowsSelected(!!value),
              ariaLabel: 'Select all',
            }),
          cell: ({
            row,
          }: {
            row: {
              getIsSelected: () => boolean
              toggleSelected: (v: boolean) => void
            }
          }) =>
            h(Checkbox, {
              checked: row.getIsSelected(),
              'onUpdate:checked': (value: boolean) =>
                row.toggleSelected(!!value),
              ariaLabel: 'Select row',
            }),
          enableSorting: false,
          enableHiding: false,
        },
      ]
    : []),
  {
    id: 'title',
    accessorKey: 'title',
    header: 'Nama Agenda',
    cell: ({ row }) => h('div', { class: 'font-medium' }, row.original.title),
  },
  {
    id: 'startTime',
    accessorKey: 'startTime',
    header: 'Tanggal Mulai',
    cell: ({ row }) => {
      const d = new Date(row.original.startTime)
      return h(
        'div',
        d.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      )
    },
  },
  {
    id: 'endTime',
    accessorKey: 'endTime',
    header: 'Tanggal Selesai',
    cell: ({ row }) => {
      const d = new Date(row.original.endTime)
      return h(
        'div',
        d.toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      )
    },
  },
  ...(actions.showActions !== false
    ? [
        {
          id: 'actions',
          enableHiding: false,
          cell: ({ row }: { row: { original: EventData } }) => {
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
                              { onClick: () => actions.onEdit(item) },
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
                                              h(Trash, {
                                                class: 'w-4 h-4 mr-2',
                                              }),
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
                                                  'Tindakan ini tidak dapat dibatalkan. Agenda kalender ini akan dihapus secara permanen.',
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
                                                {
                                                  id: `cancel-delete-${item.id}`,
                                                },
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
    : []),
]
