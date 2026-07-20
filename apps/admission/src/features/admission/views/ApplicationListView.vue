<script setup lang="ts">
import { computed, h, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Search } from 'lucide-vue-next'
import type { ColumnDef } from '@tanstack/vue-table'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import StatusBadge from '../components/StatusBadge.vue'
import type {
  AdmissionApplicationListItem,
  AdmissionStatus,
  AdmissionWaveSummary,
} from '../types'
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from '../types'
import { formatDateTime } from '../utils'

const router = useRouter()

const applications = ref<AdmissionApplicationListItem[]>([])
const waves = ref<AdmissionWaveSummary[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref<'ALL' | AdmissionStatus>('ALL')
const waveFilter = ref<string>('ALL')
const page = ref(1)
const limit = 20
const total = ref(0)

const breadcrumbs = [
  { title: 'Admin PSB', href: '/admin' },
  { title: 'Daftar Pendaftar' },
]

const columns = computed<ColumnDef<AdmissionApplicationListItem>[]>(() => [
  {
    id: 'no',
    header: 'No',
    cell: ({ row }) => (page.value - 1) * limit + row.index + 1,
    enableSorting: false,
  },
  {
    accessorKey: 'registrationNumber',
    header: 'No. Pendaftaran',
  },
  {
    accessorKey: 'fullName',
    header: 'Nama',
  },
  {
    id: 'wave',
    header: 'Gelombang',
    cell: ({ row }) => row.original.wave.code,
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => h(StatusBadge, { status: row.original.status }),
  },
  {
    id: 'payment',
    header: 'Pembayaran',
    cell: ({ row }) =>
      row.original.payment
        ? PAYMENT_STATUS_LABELS[row.original.payment.status]
        : '-',
  },
  {
    id: 'submittedAt',
    header: 'Dikirim',
    cell: ({ row }) => formatDateTime(row.original.submittedAt),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) =>
      h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: () => router.push(`/admin/pendaftar/${row.original.id}`),
        },
        () => 'Detail',
      ),
    enableSorting: false,
  },
])

async function fetchApplications() {
  loading.value = true
  try {
    const response = await admissionApi.getApplications({
      page: page.value,
      limit,
      search: searchQuery.value.trim() || undefined,
      status: statusFilter.value === 'ALL' ? undefined : statusFilter.value,
      waveId: waveFilter.value === 'ALL' ? undefined : waveFilter.value,
    })
    applications.value = response.data.data ?? []
    total.value = response.data.meta?.total ?? 0
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat daftar pendaftar.'))
  } finally {
    loading.value = false
  }
}

async function fetchWaves() {
  try {
    const response = await admissionApi.getWaves({ limit: 100 })
    waves.value = response.data.data ?? []
  } catch {
    waves.value = []
  }
}

onMounted(() => {
  void fetchApplications()
  void fetchWaves()
})

watchDebounced(
  searchQuery,
  () => {
    page.value = 1
    void fetchApplications()
  },
  { debounce: 400 },
)

function onFilterChange() {
  page.value = 1
  void fetchApplications()
}

const totalPages = computed(() => Math.max(Math.ceil(total.value / limit), 1))

function goToPage(target: number) {
  page.value = Math.min(Math.max(target, 1), totalPages.value)
  void fetchApplications()
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 sm:p-6">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader class="border-b px-6 py-5">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <CardTitle class="text-xl font-bold tracking-tight"
              >Daftar Pendaftar ({{ total }})</CardTitle
            >
            <div class="flex flex-wrap items-center gap-2">
              <div class="relative">
                <Search
                  class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Cari nama / no. pendaftaran…"
                  class="w-64 pl-8"
                />
              </div>
              <Select
                v-model="statusFilter"
                @update:model-value="onFilterChange"
              >
                <SelectTrigger class="w-48">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem
                    v-for="(label, status) in STATUS_LABELS"
                    :key="status"
                    :value="status"
                  >
                    {{ label }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                v-model="waveFilter"
                @update:model-value="onFilterChange"
              >
                <SelectTrigger class="w-44">
                  <SelectValue placeholder="Semua Gelombang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Gelombang</SelectItem>
                  <SelectItem
                    v-for="wave in waves"
                    :key="wave.id"
                    :value="wave.id"
                  >
                    {{ wave.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <div class="p-6 space-y-4">
          <DataTable
            :columns="columns"
            :data="applications"
            :is-loading="loading"
            hide-pagination
            item-label="pendaftar"
          />

          <div class="flex items-center justify-end gap-2 text-sm">
            <Button
              variant="outline"
              size="sm"
              :disabled="page <= 1"
              @click="goToPage(page - 1)"
            >
              Sebelumnya
            </Button>
            <span>Hal. {{ page }} / {{ totalPages }}</span>
            <Button
              variant="outline"
              size="sm"
              :disabled="page >= totalPages"
              @click="goToPage(page + 1)"
            >
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
