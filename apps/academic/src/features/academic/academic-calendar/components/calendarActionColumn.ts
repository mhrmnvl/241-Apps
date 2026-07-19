import { h } from 'vue'
import type { CalendarEventData, CalendarColumnActions } from '../types'
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

export function createActionColumn(actions: CalendarColumnActions) {
  return {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }: { row: { original: CalendarEventData } }) => {
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
  }
}
