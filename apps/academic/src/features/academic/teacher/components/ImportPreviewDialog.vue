<script setup lang="ts">
import { ref, watch, computed, h, type VNode } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import type { BulkImportRowResult } from '../types'
import { Button } from '@/ui/button'
import { DataTable } from '@/ui'
import { Switch } from '@/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'
import { cn } from '@/ui/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-vue-next'

const props = defineProps<{
  conflicts: BulkImportRowResult[]
  loading: boolean
}>()

const emit = defineEmits<{
  resolve: [
    decisions: {
      existingId?: string
      action: 'update' | 'skip'
      data: NonNullable<BulkImportRowResult['data']>
    }[],
  ]
}>()

const open = defineModel<boolean>('open', { default: false })

const actions = ref<Record<number, 'update' | 'skip'>>({})

watch(
  () => props.conflicts,
  (rows) => {
    actions.value = Object.fromEntries(rows.map((r) => [r.row, 'update']))
  },
  { immediate: true },
)

function setAll(action: 'update' | 'skip') {
  const newActions = { ...actions.value }
  for (const row of props.conflicts) {
    newActions[row.row] = action
  }
  actions.value = newActions
}

const summary = computed(() => {
  const successRows = props.conflicts.filter(
    (r) => r.status === 'SUCCESS',
  ).length
  const updateConflicts = props.conflicts.filter(
    (r) => r.status === 'CONFLICT' && actions.value[r.row] === 'update',
  ).length
  const willProcess = successRows + updateConflicts

  const failedRows = props.conflicts.filter((r) => r.status === 'FAILED').length
  const skipConflicts = props.conflicts.filter(
    (r) => r.status === 'CONFLICT' && actions.value[r.row] === 'skip',
  ).length

  return {
    willProcess,
    skipConflicts,
    failedRows,
  }
})

function handleApply() {
  const decisions: Parameters<typeof emit>[1] = props.conflicts
    .filter(
      (row) =>
        (row.status === 'CONFLICT' && row.existingId && row.data) ||
        (row.status === 'SUCCESS' && row.data),
    )
    .map((row) => ({
      existingId: row.existingId,
      action:
        row.status === 'SUCCESS'
          ? 'update'
          : (actions.value[row.row] ?? 'skip'),
      data: row.data!,
    }))
  emit('resolve', decisions)
}

function handleOpenChange(val: boolean) {
  open.value = val
}

function formatErrorMessage(error?: string): string {
  if (!error) return ''
  let msg = error

  msg = msg.replace(/^Validation failed:\s*/i, '')
  // Terjemahkan nama field/kolom
  msg = msg.replace(/\bidentifier\b/gi, 'Identifier')
  msg = msg.replace(/\bpassword\b/gi, 'kata sandi')
  msg = msg.replace(/\bnis\b/gi, 'NIS')
  msg = msg.replace(/\bnisn\b/gi, 'NISN')
  msg = msg.replace(/\bnik\b/gi, 'NIK')
  msg = msg.replace(/\bnip\b/gi, 'NIP')
  msg = msg.replace(/\bnuptk\b/gi, 'NUPTK')
  msg = msg.replace(/\bname\b/gi, 'nama')
  msg = msg.replace(/\bemail\b/gi, 'email')
  msg = msg.replace(/\bgender\b/gi, 'jenis kelamin')
  msg = msg.replace(/\bphone\b/gi, 'nomor telepon')
  msg = msg.replace(/\bbirthplace\b/gi, 'tempat lahir')
  msg = msg.replace(/\bbirthdate\b/gi, 'tanggal lahir')

  // Terjemahkan aturan pengecekan spesifik (multi-word)
  msg = msg.replace(
    /must be a valid ISO 8601 date string/gi,
    'harus berupa tanggal yang valid',
  )
  msg = msg.replace(/a valid ISO 8601 date string/gi, 'tanggal yang valid')
  msg = msg.replace(/must be a valid email/gi, 'harus berupa email yang valid')
  msg = msg.replace(/must be an email/gi, 'harus berupa email yang valid')
  msg = msg.replace(/an email/gi, 'email yang valid')
  msg = msg.replace(
    /must contain only numbers or \+/gi,
    'hanya boleh berisi angka atau +',
  )
  msg = msg.replace(
    /must be one of the following values:\s*MALE(,\s*FEMALE)?/gi,
    'harus Laki-laki atau Perempuan',
  )
  msg = msg.replace(
    /must be one of the following values:\s*/gi,
    'harus salah satu dari: ',
  )
  msg = msg.replace(
    /must be longer than or equal to (\d+) characters/gi,
    'harus minimal $1 karakter',
  )
  msg = msg.replace(
    /longer than or equal to (\d+) characters/gi,
    'minimal $1 karakter',
  )
  msg = msg.replace(/should not be empty/gi, 'tidak boleh kosong')
  msg = msg.replace(/is already registered/gi, 'sudah terdaftar di sistem')
  msg = msg.replace(/is already taken/gi, 'sudah digunakan')
  msg = msg.replace(/is required/gi, 'wajib diisi')
  msg = msg.replace(/must be/gi, 'harus berupa')

  // Terjemahkan nilai/enum umum lainnya
  msg = msg.replace(/\bmale\b/gi, 'Laki-laki')
  msg = msg.replace(/\bfemale\b/gi, 'Perempuan')

  // Hapus duplikasi baris jika ada (misal setelah identifier diubah jadi NIK)
  const lines = msg.split(';').map((l) => l.trim())
  const uniqueLines = Array.from(new Set(lines)).filter(Boolean)
  const formattedLines = uniqueLines.map((line) => {
    return line.charAt(0).toUpperCase() + line.slice(1)
  })

  return formattedLines.join('; ')
}

function getFieldErrorDetail(fieldKey: string, fullError: string): string {
  const cleanKey = fieldKey.toLowerCase()
  const lines = fullError.split(';').map((l) => l.trim())
  const regex = new RegExp('\\b' + cleanKey + '\\b', 'i')
  const matches = lines.filter((line) => regex.test(line))
  return matches.length > 0 ? matches.join('; ') : ''
}

function renderCellWithError(
  row: BulkImportRowResult,
  fieldKey: string,
  displayValue: unknown,
) {
  const cleanFullError = formatErrorMessage(row.error)
  const isFailed = row.status === 'FAILED'

  let hasError = false
  let tooltipText = ''
  const key = fieldKey.toLowerCase()

  if (key === 'identifier' || key === 'username') {
    const detail =
      getFieldErrorDetail('username', cleanFullError) ||
      getFieldErrorDetail('identifier', cleanFullError) ||
      getFieldErrorDetail('identitas', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'nik') {
    const detail = getFieldErrorDetail('nik', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'nip') {
    const detail = getFieldErrorDetail('nip', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'nuptk') {
    const detail = getFieldErrorDetail('nuptk', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'name') {
    const detail =
      getFieldErrorDetail('name', cleanFullError) ||
      getFieldErrorDetail('nama', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'gender') {
    const detail =
      getFieldErrorDetail('gender', cleanFullError) ||
      getFieldErrorDetail('jenis kelamin', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'birthplace') {
    const detail =
      getFieldErrorDetail('birthplace', cleanFullError) ||
      getFieldErrorDetail('tempat lahir', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'birthdate') {
    const detail =
      getFieldErrorDetail('birthdate', cleanFullError) ||
      getFieldErrorDetail('tanggal lahir', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'email') {
    const detail = getFieldErrorDetail('email', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'phone') {
    const detail =
      getFieldErrorDetail('phone', cleanFullError) ||
      getFieldErrorDetail('telepon', cleanFullError) ||
      getFieldErrorDetail('nomor telepon', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'password') {
    const detail =
      getFieldErrorDetail('password', cleanFullError) ||
      getFieldErrorDetail('kata sandi', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  } else if (key === 'employmenttypecode') {
    const detail = getFieldErrorDetail('employment', cleanFullError)
    if (detail) {
      hasError = true
      tooltipText = detail
    }
  }

  if (!hasError) {
    return h('span', { class: 'truncate' }, String(displayValue ?? '-'))
  }

  const iconColor = isFailed ? 'text-destructive' : 'text-amber-500'

  if (!displayValue) {
    return h(
      Tooltip,
      {},
      {
        default: () => [
          h(TooltipTrigger, { asChild: true }, () =>
            h('div', { class: 'flex items-center justify-center w-full' }, [
              h(AlertCircle, {
                class: cn('h-5 w-5 cursor-help shrink-0', iconColor),
              }),
            ]),
          ),
          h(
            TooltipContent,
            { side: 'top', class: 'whitespace-nowrap text-xs z-50' },
            () => tooltipText,
          ),
        ],
      },
    )
  }

  return h('div', { class: 'flex items-center gap-1.5' }, [
    h('span', { class: 'truncate' }, String(displayValue)),
    h(
      Tooltip,
      {},
      {
        default: () => [
          h(TooltipTrigger, { asChild: true }, () =>
            h(AlertCircle, {
              class: cn('h-4 w-4 cursor-help shrink-0', iconColor),
            }),
          ),
          h(
            TooltipContent,
            { side: 'top', class: 'whitespace-nowrap text-xs z-50' },
            () => tooltipText,
          ),
        ],
      },
    ),
  ])
}

const columns = computed<ColumnDef<BulkImportRowResult>[]>(() => {
  const currentActions = actions.value
  return [
    {
      accessorKey: 'row',
      header: 'Baris',
      meta: { align: 'center' },
      cell: ({ row }) => row.original.row,
    },
    {
      id: 'nik',
      header: 'NIK',
      meta: { align: 'center' },
      cell: ({ row }) =>
        renderCellWithError(row.original, 'nik', row.original.data?.nik),
    },
    {
      id: 'nip',
      header: 'NIP',
      meta: { align: 'center' },
      cell: ({ row }) =>
        renderCellWithError(row.original, 'nip', row.original.data?.nip),
    },
    {
      id: 'nuptk',
      header: 'NUPTK',
      meta: { align: 'center' },
      cell: ({ row }) =>
        renderCellWithError(row.original, 'nuptk', row.original.data?.nuptk),
    },
    {
      id: 'name',
      header: 'Nama',
      meta: { align: 'left' },
      cell: ({ row }) =>
        renderCellWithError(row.original, 'name', row.original.data?.name),
    },
    {
      id: 'gender',
      header: 'Jenis Kelamin',
      meta: { align: 'left' },
      cell: ({ row }) => {
        const val = row.original.data?.gender
        const displayVal =
          val === 'MALE'
            ? 'Laki-laki'
            : val === 'FEMALE'
              ? 'Perempuan'
              : undefined
        return renderCellWithError(row.original, 'gender', displayVal)
      },
    },
    {
      id: 'birthPlace',
      header: 'Tempat Lahir',
      meta: { align: 'left' },
      cell: ({ row }) =>
        renderCellWithError(
          row.original,
          'birthPlace',
          row.original.data?.birthPlace,
        ),
    },
    {
      id: 'birthDate',
      header: 'Tanggal Lahir',
      meta: { align: 'center' },
      cell: ({ row }) =>
        renderCellWithError(
          row.original,
          'birthDate',
          row.original.data?.birthDate,
        ),
    },
    {
      id: 'email',
      header: 'Email',
      meta: { align: 'left' },
      cell: ({ row }) =>
        renderCellWithError(row.original, 'email', row.original.data?.email),
    },
    {
      id: 'phone',
      header: 'No. Telepon',
      meta: { align: 'center' },
      cell: ({ row }) =>
        renderCellWithError(row.original, 'phone', row.original.data?.phone),
    },
    {
      id: 'employmentTypeCode',
      header: 'Status',
      meta: { align: 'center' },
      cell: ({ row }) =>
        renderCellWithError(
          row.original,
          'employmentTypeCode',
          row.original.data?.employmentTypeCode,
        ),
    },
    {
      id: 'identifier',
      header: 'Identifier',
      meta: { align: 'center' },
      cell: ({ row }) =>
        renderCellWithError(
          row.original,
          'identifier',
          row.original.data?.identifier || row.original.identifier,
        ),
    },
    {
      id: 'password',
      header: 'Kata Sandi',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const val = row.original.data?.password
        const isNotNew = row.original.status !== 'SUCCESS'

        if (isNotNew && val) {
          return h(
            Tooltip,
            {},
            {
              default: () => [
                h(TooltipTrigger, { asChild: true }, () =>
                  h(
                    'div',
                    {
                      class:
                        'flex items-center justify-center w-full gap-1 cursor-help',
                    },
                    [
                      h('span', { class: 'text-muted-foreground' }, '******'),
                      h(AlertTriangle, {
                        class: 'h-4 w-4 text-amber-500 shrink-0',
                      }),
                    ],
                  ),
                ),
                h(
                  TooltipContent,
                  { side: 'top', class: 'whitespace-nowrap text-xs z-50' },
                  () => 'Kata Sandi tidak dapat diperbarui',
                ),
              ],
            },
          )
        }

        return renderCellWithError(row.original, 'password', val)
      },
    },
    {
      id: 'actions',
      header: 'Ubah',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const r = row.original.row
        const renderTooltip = (triggerNode: VNode, text: string) => {
          return h(
            Tooltip,
            {},
            {
              default: () => [
                h(TooltipTrigger, { asChild: true }, () => triggerNode),
                h(
                  TooltipContent,
                  {
                    side: 'top',
                    class: 'max-w-[280px] text-xs z-50 break-words',
                  },
                  () => text,
                ),
              ],
            },
          )
        }

        if (row.original.status === 'FAILED') {
          return renderTooltip(
            h(
              'div',
              { class: 'flex items-center justify-center w-full cursor-help' },
              [
                h(AlertCircle, {
                  class: 'h-5 w-5 text-destructive shrink-0',
                }),
              ],
            ),
            'Tidak akan diimpor',
          )
        }
        if (row.original.status === 'SUCCESS') {
          return renderTooltip(
            h(
              'div',
              { class: 'flex items-center justify-center w-full cursor-help' },
              [
                h(CheckCircle2, {
                  class: 'h-5 w-5 text-emerald-600 shrink-0',
                }),
              ],
            ),
            'Data baru',
          )
        }
        const isUpdate = currentActions[r] === 'update'
        const tooltipText = isUpdate ? 'Perbarui' : 'Lewati'

        return h('div', { class: 'flex items-center justify-center' }, [
          renderTooltip(
            h('div', { class: 'flex items-center' }, [
              h(Switch, {
                modelValue: isUpdate,
                disabled: props.loading,
                'onUpdate:modelValue': (val: boolean) => {
                  actions.value = {
                    ...actions.value,
                    [r]: val ? 'update' : 'skip',
                  }
                },
              }),
            ]),
            tooltipText,
          ),
        ])
      },
    },
  ]
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogContent
      class="w-[98vw] sm:max-w-[98vw] max-h-[95vh] p-0 flex flex-col overflow-hidden"
    >
      <DialogHeader class="px-6 py-4 bg-muted/20 border-b shrink-0">
        <DialogTitle>Pratinjau Impor</DialogTitle>
      </DialogHeader>

      <div class="px-6 py-4 flex-1 min-h-0 overflow-y-auto space-y-4">
        <DataTable
          :key="Object.values(actions).join('-')"
          :columns="columns"
          :data="conflicts"
          :is-loading="loading"
          :page-size="conflicts.length || 10"
          max-height="400px"
          hide-pagination
          hide-per-page
        />
      </div>

      <DialogFooter
        class="px-6 py-4 bg-muted/30 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0"
      >
        <div
          class="flex flex-wrap items-center gap-2 text-xs justify-center sm:justify-start"
        >
          <div
            class="flex items-center gap-1.5 px-3 h-9 bg-emerald-50/30 border border-emerald-200 rounded-md text-foreground font-medium select-none"
          >
            <CheckCircle2 class="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{{ summary.willProcess }} diproses</span>
          </div>
          <div
            class="flex items-center gap-1.5 px-3 h-9 bg-amber-50/30 border border-amber-200 rounded-md text-foreground font-medium select-none"
          >
            <AlertTriangle class="h-4 w-4 text-amber-500 shrink-0" />
            <span>{{ summary.skipConflicts }} dilewati</span>
          </div>
          <div
            class="flex items-center gap-1.5 px-3 h-9 bg-red-50/30 border border-red-200 rounded-md text-foreground font-medium select-none"
          >
            <AlertCircle class="h-4 w-4 text-red-600 shrink-0" />
            <span>{{ summary.failedRows }} gagal</span>
          </div>
        </div>

        <div
          class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto"
        >
          <Button
            variant="outline"
            :disabled="loading"
            @click="handleOpenChange(false)"
          >
            Batal
          </Button>
          <div class="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                :disabled="loading"
                as-child
              >
                <Button
                  variant="outline"
                  class="gap-1.5 h-9 text-xs"
                >
                  Pilihan Cepat
                  <ChevronDown class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                class="z-[60]"
              >
                <DropdownMenuItem @click="setAll('update')">
                  Perbarui Semua
                </DropdownMenuItem>
                <DropdownMenuItem @click="setAll('skip')">
                  Lewati Semua
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              :disabled="loading"
              @click="handleApply"
            >
              {{ loading ? 'Memproses...' : 'Terapkan' }}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
