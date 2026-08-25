<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
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
import { Printer, Search } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type {
  InventoryAsset,
  InventoryMetadata,
  AssetQueryParams,
  LabelUnit,
} from '../types'
import { createColumns } from '../components/columns'
import {
  DEFAULT_LABEL_SIZE_ID,
  DEFAULT_PAPER_ID,
  LABEL_SIZES,
  PAPER_SIZES,
  labelSheetLayout,
} from '../logic/labelSheetLayout'
import UnitLabelSheet from '../components/UnitLabelSheet.vue'
import { inventoryReferenceService } from '../services/inventoryReferenceService'
import { assetService } from '../services/assetService'

const assets = ref<InventoryAsset[]>([])
const loading = ref(false)

const metadata = ref<InventoryMetadata>({
  categories: [],
  locations: [],
  conditions: [],
  statuses: [],
  fundingSources: [],
})

const filters = ref({
  keyword: '',
  categoryId: 'all',
})

const tableColumns = computed(() =>
  createColumns({
    showActions: false,
    selectable: true,
    onEdit: () => undefined,
    onDelete: () => undefined,
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
    }

    assets.value = (await assetService.list(params)).items
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

watch(
  () => filters.value.categoryId,
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

// --- Batch label printing across selected assets ---
const selectedAssets = ref<InventoryAsset[]>([])
/**
 * How big the sticker is, and what it is being printed on.
 *
 * Two independent choices, which is the point: a label is a physical object, so
 * its size is picked once and paper only decides how many fit on a sheet. The
 * same asset comes off the guillotine the same size whether the tray held A4 or
 * A3.
 */
const labelSize = ref(DEFAULT_LABEL_SIZE_ID)
const paperSize = ref(DEFAULT_PAPER_ID)

/** Said out loud: it is the number that decides how much paper to load. */
const sheetPlan = computed(() =>
  labelSheetLayout(paperSize.value, labelSize.value),
)

const labelSheetRef = ref<{ print: () => Promise<void> } | null>(null)
const printUnits = ref<LabelUnit[]>([])

const selectedUnitCount = computed(() =>
  selectedAssets.value.reduce((sum, a) => sum + (a.units?.length ?? 0), 0),
)

function handleSelectionChange(rows: InventoryAsset[]) {
  selectedAssets.value = rows
}

async function printSelectedLabels() {
  const units: LabelUnit[] = []
  for (const a of selectedAssets.value) {
    for (const u of a.units ?? []) {
      units.push({
        id: u.id,
        unitNumber: u.unitNumber,
        barcode: u.barcode,
        assetName: a.name,
      })
    }
  }
  if (units.length === 0) return
  printUnits.value = units
  await nextTick()
  await labelSheetRef.value?.print()
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
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight"
            >Cetak Label Aset</CardTitle
          >
          <p class="text-sm text-muted-foreground mt-1">
            Pilih satu atau beberapa aset untuk mencetak label seluruh unitnya
            sekaligus.
          </p>
          <!-- The arithmetic said out loud, because it is what decides how much
               paper to put in the tray. -->
          <p
            v-if="selectedUnitCount > 0"
            class="text-xs text-muted-foreground mt-1.5"
          >
            {{ sheetPlan.paper.label.split(' (')[0] }} ·
            {{ sheetPlan.size.label.split(' (')[0] }} —
            <strong class="text-foreground">
              {{ sheetPlan.labelsPerPage }} label/halaman
            </strong>
            ({{ sheetPlan.columns }} × {{ sheetPlan.rowsPerPage }}), butuh
            {{ Math.ceil(selectedUnitCount / sheetPlan.labelsPerPage) }} halaman
          </p>
        </div>
        <div
          v-if="selectedAssets.length > 0"
          class="flex flex-col sm:flex-row w-full sm:w-auto gap-2"
        >
          <Select
            :model-value="paperSize"
            @update:model-value="paperSize = String($event)"
          >
            <SelectTrigger class="w-full sm:w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="paper in PAPER_SIZES"
                :key="paper.id"
                :value="paper.id"
              >
                {{ paper.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            :model-value="labelSize"
            @update:model-value="labelSize = String($event)"
          >
            <SelectTrigger class="w-full sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="size in LABEL_SIZES"
                :key="size.id"
                :value="size.id"
              >
                {{ size.label }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            class="w-full sm:w-auto"
            :disabled="selectedUnitCount === 0"
            @click="printSelectedLabels"
          >
            <Printer class="size-4 mr-2" />
            Cetak Label ({{ selectedUnitCount }} unit)
          </Button>
        </div>
      </CardHeader>

      <div class="p-6">
        <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
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

        <DataTable
          :columns="tableColumns"
          :data="assets"
          :is-loading="loading"
          item-label="aset"
          @selection-change="handleSelectionChange"
        />
      </div>
    </Card>
  </div>

  <!-- Hidden print sheet (visible only when printing) -->
  <UnitLabelSheet
    ref="labelSheetRef"
    :units="printUnits"
    :label-size="labelSize"
    :paper-size="paperSize"
  />
</template>
