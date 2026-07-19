<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
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
import { Plus, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import { inventoryApi } from '../api/inventoryApi'
import type {
  InventoryAsset,
  InventoryMetadata,
  AssetQueryParams,
} from '../types'
import { createColumns } from '../components/columns'

const { isAdmin } = useRoleGuard()
const router = useRouter()

const breadcrumbs = [
  { title: 'Inventaris', href: '#' },
  { title: 'Daftar Aset' },
]

// Component state
const assets = ref<InventoryAsset[]>([])
const totalAssets = ref(0)
const loading = ref(false)

const metadata = ref<InventoryMetadata>({
  categories: [],
  locations: [],
  conditions: [],
  statuses: [],
  fundingSources: [],
})

// Query filters matching student list layout
const filters = ref({
  keyword: '',
  categoryId: 'all',
  locationId: 'all',
  statusId: 'all',
  conditionId: 'all',
})

// Columns configuration
const tableColumns = computed(() =>
  createColumns({
    showActions: isAdmin.value,
    onEdit: (asset) => {
      void router.push(`/inventory/assets/${asset.id}/edit`)
    },
    onDelete: async (asset, { closeAlert, setLoading }) => {
      setLoading(true)
      try {
        await inventoryApi.deleteAsset(asset.id)
        toast.success(`Aset "${asset.name}" berhasil dihapus.`)
        await fetchAssets()
        closeAlert()
      } catch (e: unknown) {
        toast.error(getIndonesianErrorMessage(e, 'Gagal menghapus data aset.'))
      } finally {
        setLoading(false)
      }
    },
  }),
)

// Fetching functions
async function fetchAssets() {
  loading.value = true
  try {
    const params: AssetQueryParams = {
      page: 1,
      limit: 1000, // Fetch all to let DataTable handle pagination client-side (matching Student list)
      keyword: filters.value.keyword.trim()
        ? filters.value.keyword.trim()
        : undefined,
      categoryId:
        filters.value.categoryId !== 'all'
          ? filters.value.categoryId
          : undefined,
      locationId:
        filters.value.locationId !== 'all'
          ? filters.value.locationId
          : undefined,
      statusId:
        filters.value.statusId !== 'all' ? filters.value.statusId : undefined,
      conditionId:
        filters.value.conditionId !== 'all'
          ? filters.value.conditionId
          : undefined,
    }

    const response = await inventoryApi.getAssets(params)
    const envelope = response.data
    assets.value = envelope.data ?? []
    totalAssets.value = envelope.meta?.total ?? assets.value.length
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat data aset.'))
  } finally {
    loading.value = false
  }
}

async function fetchMetadata() {
  try {
    const response = await inventoryApi.getInventoryMetadata()
    if (response.data?.data) {
      metadata.value = response.data.data
    }
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal memuat parameter klasifikasi.'),
    )
  }
}

// Watch filters to trigger fetch
watch(
  () => [
    filters.value.categoryId,
    filters.value.locationId,
    filters.value.statusId,
    filters.value.conditionId,
  ],
  () => {
    void fetchAssets()
  },
)

watchDebounced(
  () => filters.value.keyword,
  () => {
    void fetchAssets()
  },
  { debounce: 400 },
)

function openAddForm() {
  void router.push('/inventory/assets/create')
}

onMounted(async () => {
  await Promise.all([fetchAssets(), fetchMetadata()])
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
            <CardTitle class="text-2xl font-bold tracking-tight"
              >Daftar Aset</CardTitle
            >
          </div>
          <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button
              v-if="isAdmin"
              class="w-full sm:w-auto"
              @click="openAddForm"
            >
              <Plus class="size-4 mr-2" />
              Tambah Aset
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <!-- Filters Section matching Academic Layout -->
          <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <!-- Category -->
            <Select
              :model-value="filters.categoryId"
              @update:model-value="
                filters.categoryId = typeof $event === 'string' ? $event : 'all'
              "
            >
              <SelectTrigger
                class="w-full lg:w-fit lg:min-w-[150px] px-3! gap-2!"
              >
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem
                  v-for="cat in metadata.categories"
                  :key="cat.id"
                  :value="cat.id"
                >
                  {{ cat.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Location -->
            <Select
              :model-value="filters.locationId"
              @update:model-value="
                filters.locationId = typeof $event === 'string' ? $event : 'all'
              "
            >
              <SelectTrigger
                class="w-full lg:w-fit lg:min-w-[140px] px-3! gap-2!"
              >
                <SelectValue placeholder="Pilih lokasi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Lokasi</SelectItem>
                <SelectItem
                  v-for="loc in metadata.locations"
                  :key="loc.id"
                  :value="loc.id"
                >
                  {{ loc.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Status -->
            <Select
              :model-value="filters.statusId"
              @update:model-value="
                filters.statusId = typeof $event === 'string' ? $event : 'all'
              "
            >
              <SelectTrigger
                class="w-full lg:w-fit lg:min-w-[130px] px-3! gap-2!"
              >
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem
                  v-for="status in metadata.statuses"
                  :key="status.id"
                  :value="status.id"
                >
                  {{ status.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Condition -->
            <Select
              :model-value="filters.conditionId"
              @update:model-value="
                filters.conditionId =
                  typeof $event === 'string' ? $event : 'all'
              "
            >
              <SelectTrigger
                class="w-full lg:w-fit lg:min-w-[135px] px-3! gap-2!"
              >
                <SelectValue placeholder="Pilih kondisi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kondisi</SelectItem>
                <SelectItem
                  v-for="cond in metadata.conditions"
                  :key="cond.id"
                  :value="cond.id"
                >
                  {{ cond.name }}
                </SelectItem>
              </SelectContent>
            </Select>

            <!-- Search Keyword Pushed to Right -->
            <div class="relative lg:ml-auto lg:w-[240px]">
              <Search
                class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                v-model="filters.keyword"
                placeholder="Cari aset..."
                class="pl-9"
              />
            </div>
          </div>

          <!-- DataTable with correct loading and label parameters -->
          <DataTable
            :columns="tableColumns"
            :data="assets"
            :total-items="totalAssets"
            :is-loading="loading"
            item-label="aset"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
