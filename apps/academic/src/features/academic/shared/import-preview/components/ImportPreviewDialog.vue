<script setup lang="ts" generic="TData">
import { ref, watch, computed } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Button } from '@/ui/button'
import { DataTable } from '@/ui'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
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
  Loader2,
} from 'lucide-vue-next'
import type { ImportColumnDescriptor, ImportPreviewRow } from '../types'
import { buildResolveDecisions } from '../logic/buildResolveDecisions'
import { buildImportColumns } from '../logic/buildImportColumns'

const props = defineProps<{
  rows: ImportPreviewRow<TData>[]
  columns: ImportColumnDescriptor[]
  loading: boolean
}>()

const emit = defineEmits<{
  resolve: [decisions: ReturnType<typeof buildResolveDecisions<TData>>]
}>()

const open = defineModel<boolean>('open', { default: false })

const actions = ref<Record<number, 'update' | 'skip'>>({})

watch(
  () => props.rows,
  (rows) => {
    actions.value = Object.fromEntries(rows.map((r) => [r.row, 'update']))
  },
  { immediate: true },
)

function setAll(action: 'update' | 'skip') {
  const newActions = { ...actions.value }
  for (const row of props.rows) {
    newActions[row.row] = action
  }
  actions.value = newActions
}

const summary = computed(() => {
  const successRows = props.rows.filter((r) => r.status === 'SUCCESS').length
  const updateConflicts = props.rows.filter(
    (r) => r.status === 'CONFLICT' && actions.value[r.row] === 'update',
  ).length
  const willProcess = successRows + updateConflicts

  const failedRows = props.rows.filter((r) => r.status === 'FAILED').length
  const skipConflicts = props.rows.filter(
    (r) => r.status === 'CONFLICT' && actions.value[r.row] === 'skip',
  ).length

  return { willProcess, skipConflicts, failedRows }
})

function handleApply() {
  emit('resolve', buildResolveDecisions(props.rows, actions.value))
}

function handleOpenChange(val: boolean) {
  open.value = val
}

const tableColumns = computed<ColumnDef<ImportPreviewRow<TData>>[]>(() =>
  buildImportColumns<TData>({
    descriptors: props.columns,
    actions: actions.value,
    loading: props.loading,
    onActionChange: (row, action) => {
      actions.value = { ...actions.value, [row]: action }
    },
  }),
)
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
          :columns="tableColumns"
          :data="rows"
          :is-loading="loading"
          :page-size="rows.length || 10"
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
              <Loader2
                v-if="loading"
                class="size-4 mr-2 animate-spin"
              />
              {{ loading ? 'Memproses...' : 'Terapkan' }}
            </Button>
          </div>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
