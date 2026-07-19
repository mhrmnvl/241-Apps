<script setup lang="ts">
import { h, onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Search, RotateCcw } from 'lucide-vue-next'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { auditLogsApi } from '../api/auditLogsApi'
import type { AuditLog } from '../types'
import AuditLogDetailSheet from '../components/AuditLogDetailSheet.vue'
import type { ColumnDef } from '@tanstack/vue-table'

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Log Aktivitas', href: '/pengaturan/audit-logs' },
]

const logs = ref<AuditLog[]>([])
const isLoading = ref(false)
const totalItems = ref(0)

const filters = ref({
  page: 1,
  limit: 10,
  search: '',
  action: '',
  resource: '',
})

const isSheetOpen = ref(false)
const selectedLog = ref<AuditLog | null>(null)

const fetchLogs = async () => {
  isLoading.value = true
  try {
    const res = await auditLogsApi.getAuditLogs({
      page: filters.value.page,
      limit: filters.value.limit,
      search: filters.value.search ? filters.value.search : undefined,
      action: filters.value.action ? filters.value.action : undefined,
      resource: filters.value.resource ? filters.value.resource : undefined,
    })
    logs.value = res.data?.data ?? []
    totalItems.value = res.data?.meta?.total ?? 0
  } catch (error) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal memuat log aktivitas.'))
  } finally {
    isLoading.value = false
  }
}

const resetFilters = () => {
  filters.value = {
    page: 1,
    limit: 10,
    search: '',
    action: '',
    resource: '',
  }
  void fetchLogs()
}

// Refetch on page change immediately
watch(
  () => filters.value.page,
  () => {
    void fetchLogs()
  },
)

// Debounce other filters and reset to page 1
watchDebounced(
  () => [filters.value.search, filters.value.resource, filters.value.action],
  () => {
    filters.value.page = 1
    void fetchLogs()
  },
  { debounce: 400 },
)

const formatIndonesianDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date
    .toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/\./g, ':')
}

const getActionVariant = (action: string) => {
  const lower = action.toLowerCase()
  if (
    lower.includes('create') ||
    lower.includes('store') ||
    lower.includes('add')
  )
    return 'default'
  if (
    lower.includes('update') ||
    lower.includes('edit') ||
    lower.includes('patch')
  )
    return 'outline'
  if (
    lower.includes('delete') ||
    lower.includes('destroy') ||
    lower.includes('remove')
  )
    return 'destructive'
  return 'secondary'
}

const columns: ColumnDef<AuditLog>[] = [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) =>
      (filters.value.page - 1) * filters.value.limit + row.index + 1,
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'createdAt',
    header: 'Waktu',
    cell: ({ row }) => formatIndonesianDateTime(row.original.createdAt),
  },
  {
    id: 'user',
    header: 'Pengguna',
    cell: ({ row }) => row.original.user?.identifier ?? 'Sistem / Anonim',
  },
  {
    accessorKey: 'action',
    header: 'Aksi',
    cell: ({ row }) => {
      const action = row.getValue<string>('action')
      return h(
        Badge,
        {
          variant: getActionVariant(action),
          class: 'text-[11px] px-2 py-0.5 font-medium font-mono',
        },
        () => action,
      )
    },
  },
  {
    accessorKey: 'resource',
    header: 'Modul / Entitas',
    cell: ({ row }) =>
      h(
        Badge,
        {
          variant: 'secondary',
          class: 'font-mono text-[10px] px-2 py-0.5 rounded border',
        },
        () => row.getValue<string>('resource'),
      ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => row.getValue<string>('ipAddress') ?? '-',
  },
  {
    id: 'actions',
    header: 'Opsi',
    cell: ({ row }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          size: 'sm',
          onClick: () => {
            selectedLog.value = row.original
            isSheetOpen.value = true
          },
        },
        () => 'Detail',
      )
    },
  },
]

const handlePageChange = (page: number) => {
  filters.value.page = page
}

onMounted(() => {
  void fetchLogs()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Log Aktivitas Sistem
            </CardTitle>
          </div>
        </CardHeader>

        <div class="p-6">
          <!-- Filters Block -->
          <div class="flex flex-col md:flex-row gap-4 items-end mb-6">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
              <div class="space-y-1.5">
                <span class="text-xs font-semibold text-muted-foreground"
                  >Kata Kunci Pencarian</span
                >
                <div class="relative">
                  <Search
                    class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    v-model="filters.search"
                    placeholder="Cari kata kunci, IP, agent..."
                    class="pl-9 h-9 text-sm"
                  />
                </div>
              </div>
              <div class="space-y-1.5">
                <span class="text-xs font-semibold text-muted-foreground"
                  >Filter Modul</span
                >
                <Input
                  v-model="filters.resource"
                  placeholder="Contoh: students, roles"
                  class="h-9 text-sm"
                />
              </div>
              <div class="space-y-1.5">
                <span class="text-xs font-semibold text-muted-foreground"
                  >Filter Aksi</span
                >
                <Input
                  v-model="filters.action"
                  placeholder="Contoh: create, update"
                  class="h-9 text-sm"
                />
              </div>
            </div>
            <Button
              variant="outline"
              class="h-9 gap-1.5 w-full md:w-auto"
              @click="resetFilters"
            >
              <RotateCcw class="size-3.5" />
              Reset
            </Button>
          </div>

          <DataTable
            :columns="columns"
            :data="logs"
            :is-loading="isLoading"
            :total-items="totalItems"
            item-label="log aktivitas"
            @update:page="handlePageChange"
          />
        </div>
      </Card>

      <AuditLogDetailSheet
        v-if="isSheetOpen"
        v-model:open="isSheetOpen"
        :log="selectedLog"
      />
    </div>
  </AppLayout>
</template>
