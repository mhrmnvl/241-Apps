<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Plus, Search, Filter } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { useRoleGuard } from '@/features/platform/auth'
import { inventoryApi } from '../api/inventoryApi'
import type {
  InventoryAsset,
  InventoryMetadata,
  AssetQueryParams,
} from '../types'
import { createColumns } from '../components/columns'
import { inventoryReferenceService } from '../services/inventoryReferenceService'

const { can } = useRoleGuard()
const router = useRouter()

// Component state
const assets = ref<InventoryAsset[]>([])
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

const isFilterDialogOpen = ref(false)

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.categoryId !== 'all') count++
  if (filters.value.locationId !== 'all') count++
  if (filters.value.statusId !== 'all') count++
  if (filters.value.conditionId !== 'all') count++
  return count
})

function resetAllFilters() {
  filters.value.categoryId = 'all'
  filters.value.locationId = 'all'
  filters.value.statusId = 'all'
  filters.value.conditionId = 'all'
}

function handleFilterChange(
  key: 'categoryId' | 'locationId' | 'statusId' | 'conditionId',
  value: unknown,
) {
  filters.value[key] = typeof value === 'string' ? value : 'all'
}

// Columns configuration
const tableColumns = computed(() =>
  createColumns({
    showActions: can('inventory.update') || can('inventory.delete'),
    canUpdate: can('inventory.update'),
    canDelete: can('inventory.delete'),
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

async function fetchAssets() {
  loading.value = true
  try {
    const params: AssetQueryParams = {
      page: 1,
      limit: 1000,
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
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat data aset.'))
  } finally {
    loading.value = false
  }
}

async function fetchMetadata() {
  try {
    const data = await inventoryReferenceService.fetchMetadata()
    if (data) {
      metadata.value = data
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
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div>
          <CardTitle class="text-xl sm:text-2xl font-bold tracking-tight"
            >Daftar Aset</CardTitle
          >
        </div>
        <div class="flex items-center gap-2">
          <Button
            v-if="can('inventory.create')"
            size="sm"
            class="sm:h-10 sm:px-4 text-xs sm:text-sm"
            @click="openAddForm"
          >
            <Plus class="size-4 mr-1 sm:mr-2" />
            Tambah Aset
          </Button>
        </div>
      </CardHeader>

      <div class="p-6">
        <!-- Filters Section matching Academic Layout -->
        <div class="mb-6">
          <!-- Desktop Layout: Inline selects -->
          <div class="hidden lg:flex lg:flex-row lg:items-center gap-3">
            <!-- Category -->
            <Select
              :model-value="filters.categoryId"
              @update:model-value="handleFilterChange('categoryId', $event)"
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
              @update:model-value="handleFilterChange('locationId', $event)"
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
              @update:model-value="handleFilterChange('statusId', $event)"
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
              @update:model-value="handleFilterChange('conditionId', $event)"
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

          <!-- Mobile Layout: Search + Filter Dialog Button -->
          <div class="flex flex-col lg:hidden gap-3">
            <div class="flex items-center gap-2">
              <div class="relative flex-1">
                <Search
                  class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  v-model="filters.keyword"
                  placeholder="Cari aset..."
                  class="pl-9"
                />
              </div>
              <Button
                variant="outline"
                class="relative shrink-0"
                @click="isFilterDialogOpen = true"
              >
                <Filter class="size-4 mr-2" />
                Filter
                <span
                  v-if="activeFiltersCount > 0"
                  class="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground"
                >
                  {{ activeFiltersCount }}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <DataTable
          :columns="tableColumns"
          :data="assets"
          :is-loading="loading"
          item-label="aset"
        />
      </div>
    </Card>
  </div>

  <Dialog v-model:open="isFilterDialogOpen">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>Filter Aset</DialogTitle>
        <DialogDescription class="sr-only"> </DialogDescription>
      </DialogHeader>

      <div class="p-6 space-y-4">
        <!-- Category -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground"
            >Kategori</label
          >
          <Select
            :model-value="filters.categoryId"
            @update:model-value="handleFilterChange('categoryId', $event)"
          >
            <SelectTrigger class="w-full">
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
        </div>

        <!-- Location -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground"
            >Lokasi</label
          >
          <Select
            :model-value="filters.locationId"
            @update:model-value="handleFilterChange('locationId', $event)"
          >
            <SelectTrigger class="w-full">
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
        </div>

        <!-- Status -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground"
            >Status</label
          >
          <Select
            :model-value="filters.statusId"
            @update:model-value="handleFilterChange('statusId', $event)"
          >
            <SelectTrigger class="w-full">
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
        </div>

        <!-- Condition -->
        <div class="space-y-1.5">
          <label class="text-xs font-semibold text-muted-foreground"
            >Kondisi</label
          >
          <Select
            :model-value="filters.conditionId"
            @update:model-value="handleFilterChange('conditionId', $event)"
          >
            <SelectTrigger class="w-full">
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
        </div>
      </div>

      <DialogFooter
        class="px-6 py-4 border-t bg-muted/20 flex flex-row items-center justify-end gap-2"
      >
        <Button
          variant="outline"
          size="sm"
          class="flex-1 sm:flex-none"
          @click="resetAllFilters"
        >
          Atur Ulang
        </Button>
        <Button
          size="sm"
          class="flex-1 sm:flex-none"
          @click="isFilterDialogOpen = false"
        >
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
