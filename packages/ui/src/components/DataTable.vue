<script setup lang="ts" generic="TData extends object, TValue">
import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnPinningState,
  SortingState,
  Row,
} from '@tanstack/vue-table'
import type { ColumnMetaAlign } from '@/shared/types/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { computed, ref, watch } from 'vue'

import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Skeleton } from '@/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    totalItems?: number
    page?: number
    itemLabel?: string
    filterColumn?: string
    filterPlaceholder?: string
    hidePerPage?: boolean
    hidePagination?: boolean
    isLoading?: boolean
  }>(),
  {
    page: 1,
  },
)

const emit = defineEmits<{
  (e: 'selectionChange', rows: TData[]): void
  (e: 'update:page', page: number): void
  (e: 'update:page-size', pageSize: number): void
}>()

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const rowSelection = ref({})
const columnPinning = ref<ColumnPinningState>({ right: ['actions'] })

const pagination = ref({
  pageIndex: 0,
  pageSize: 10,
})

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getRowId: (row: TData, index: number) =>
    (row as { id?: string }).id ?? String(index),
  enableRowSelection: true,
  get manualPagination() {
    return props.totalItems !== undefined
  },
  get pageCount(): number | undefined {
    if (props.totalItems !== undefined) {
      return Math.ceil(props.totalItems / pagination.value.pageSize)
    }
    return undefined
  },
  onSortingChange: (updaterOrValue) => {
    sorting.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting.value)
        : updaterOrValue
  },
  onColumnFiltersChange: (updaterOrValue) => {
    columnFilters.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(columnFilters.value)
        : updaterOrValue
  },
  onPaginationChange: (updaterOrValue) => {
    pagination.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination.value)
        : updaterOrValue
  },
  onRowSelectionChange: (updaterOrValue) => {
    rowSelection.value =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(rowSelection.value)
        : updaterOrValue
    setTimeout(() => {
      emit(
        'selectionChange',
        table.getSelectedRowModel().flatRows.map((r: Row<TData>) => r.original),
      )
    }, 0)
  },
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get pagination() {
      return pagination.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get columnPinning() {
      return columnPinning.value
    },
  },
})

const showFilterInput = computed(() => Boolean(props.filterColumn))
const filterColumnKey = computed(() => props.filterColumn ?? 'name')
const filterPlaceholder = computed(
  () => props.filterPlaceholder ?? 'Cari data...',
)
const totalItemCount = computed(() => props.totalItems ?? props.data.length)
const itemLabel = computed(() => props.itemLabel ?? 'data')

watch(
  () => props.page,
  (newPage) => {
    if (newPage !== undefined) {
      pagination.value = {
        ...pagination.value,
        pageIndex: newPage - 1,
      }
    }
  },
  { immediate: true },
)

watch(
  () => props.data.length,
  () => {
    if (props.totalItems === undefined) {
      pagination.value = {
        ...pagination.value,
        pageIndex: 0,
      }
    }
  },
)

const setPage = (val: number) => {
  pagination.value = {
    ...pagination.value,
    pageIndex: val - 1,
  }
  emit('update:page', val)
}

const setPageSize = (size: number) => {
  pagination.value = {
    pageIndex: 0,
    pageSize: size,
  }
  emit('update:page-size', size)
}

defineExpose({ table })
</script>

<template>
  <div class="flex flex-col gap-4">
    <div
      v-if="!hidePerPage || showFilterInput || $slots['header-right']"
      class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-4 w-full"
    >
      <div
        v-if="!hidePerPage"
        class="flex items-center gap-2"
      >
        <span class="text-xs text-muted-foreground whitespace-nowrap">
          Baris per halaman
        </span>
        <Select
          :model-value="String(pagination.pageSize)"
          @update:model-value="(val) => setPageSize(Number(val))"
        >
          <SelectTrigger class="h-8 w-[50px] [&>svg]:hidden">
            <SelectValue :placeholder="String(pagination.pageSize)" />
          </SelectTrigger>
          <SelectContent side="top">
            <SelectItem
              v-for="size in [5, 10, 25, 50, 100]"
              :key="size"
              :value="String(size)"
            >
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
        <slot name="header-right">
          <Input
            v-if="showFilterInput"
            :placeholder="filterPlaceholder"
            :model-value="
              (table.getColumn(filterColumnKey)?.getFilterValue() as string) ??
              ''
            "
            class="h-8 w-full sm:w-44 sm:max-w-none text-sm"
            @update:model-value="
              table.getColumn(filterColumnKey)?.setFilterValue($event)
            "
          />
        </slot>
      </div>
    </div>

    <div class="border rounded-md bg-background overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow
            v-for="headerGroup in table.getHeaderGroups()"
            :key="headerGroup.id"
            class="bg-muted/50 hover:bg-muted/50"
          >
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              class="px-4"
              :class="[
                {
                  'w-[1%] whitespace-nowrap text-center':
                    header.column.id === 'actions',
                  'sticky right-0 z-10 bg-muted border-l border-border shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.10)]':
                    header.column.getIsPinned() === 'right',
                  'w-[50px] px-4 text-center': ['no', 'select'].includes(
                    header.column.id,
                  ),
                  'text-center':
                    (header.column.columnDef.meta as ColumnMetaAlign)?.align ===
                    'center',
                  'text-right':
                    (header.column.columnDef.meta as ColumnMetaAlign)?.align ===
                    'right',
                  'text-left':
                    (header.column.columnDef.meta as ColumnMetaAlign)?.align ===
                    'left',
                },
              ]"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="isLoading">
            <TableRow
              v-for="i in 5"
              :key="i"
            >
              <TableCell
                v-for="j in columns.length"
                :key="j"
                class="px-4 py-2.5"
              >
                <Skeleton class="h-5 w-full" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                class="px-4 py-1"
                :class="[
                  {
                    'w-[1%] whitespace-nowrap text-center':
                      cell.column.id === 'actions',
                    'sticky right-0 z-10 bg-muted border-l border-border shadow-[-6px_0_10px_-2px_rgba(0,0,0,0.15)]':
                      cell.column.getIsPinned() === 'right',
                    'w-[50px] px-4 text-center': ['no', 'select'].includes(
                      cell.column.id,
                    ),
                    'text-center':
                      (cell.column.columnDef.meta as ColumnMetaAlign)?.align ===
                      'center',
                    'text-right':
                      (cell.column.columnDef.meta as ColumnMetaAlign)?.align ===
                      'right',
                    'text-left':
                      (cell.column.columnDef.meta as ColumnMetaAlign)?.align ===
                      'left',
                  },
                ]"
              >
                <FlexRender
                  :render="cell.column.columnDef.cell"
                  :props="cell.getContext()"
                />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell
                :colspan="columns.length"
                class="h-24 text-center"
              >
                Tidak ada data.
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <div
      v-if="!hidePagination"
      class="flex items-center justify-between px-2"
    >
      <div class="flex-1 text-sm text-muted-foreground">
        Menampilkan {{ table.getRowModel().rows.length }} dari
        {{ totalItemCount }} {{ itemLabel }}
      </div>
      <Pagination
        v-if="table.getPageCount() > 1"
        :page="pagination.pageIndex + 1"
        :items-per-page="pagination.pageSize"
        :total="totalItemCount"
        :sibling-count="1"
        :show-edges="false"
        class="mx-0 w-auto"
        @update:page="setPage"
      >
        <PaginationContent
          v-slot="{ items }"
          class="flex items-center gap-1"
        >
          <PaginationFirst
            size="icon"
            class="size-8 p-0"
          >
            <ChevronsLeft class="size-4" />
          </PaginationFirst>
          <PaginationPrevious
            size="icon"
            class="size-8 p-0"
          >
            <ChevronLeft class="size-4" />
          </PaginationPrevious>

          <template
            v-for="(item, index) in items"
            :key="index"
          >
            <PaginationItem
              v-if="item.type === 'page'"
              :value="item.value"
              :is-active="item.value === pagination.pageIndex + 1"
              class="size-8"
            >
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis
              v-else
              :index="index"
              class="size-8"
            />
          </template>

          <PaginationNext
            size="icon"
            class="size-8 p-0"
          >
            <ChevronRight class="size-4" />
          </PaginationNext>
          <PaginationLast
            size="icon"
            class="size-8 p-0"
          >
            <ChevronsRight class="size-4" />
          </PaginationLast>
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>
