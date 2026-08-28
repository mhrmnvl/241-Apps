<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { DataTable } from '@/ui'
import { toast } from 'vue-sonner'
import type {
  InventoryAsset,
  InventoryAssetUnit,
  InventoryMetadata,
  AssetSavePayload,
  LabelUnit,
} from '../types'
import AssetForm from '../components/AssetForm.vue'
import UnitLabelSheet from '../components/UnitLabelSheet.vue'
import {
  DEFAULT_PAPER_ID,
  PAPER_SIZES,
  labelSheetLayout,
} from '../logic/labelSheetLayout'
import { createUnitColumns } from '../components/unitColumns'
import { Button } from '@/ui'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
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
import { ChevronLeft, Plus, Printer } from 'lucide-vue-next'
import { inventoryReferenceService } from '../services/inventoryReferenceService'
import { assetService } from '../services/assetService'

const router = useRouter()
const route = useRoute()
const assetId = route.params.id as string

const isSaving = ref(false)
const isLoadingAsset = ref(true)
const asset = ref<InventoryAsset | null>(null)

const metadata = ref<InventoryMetadata>({
  categories: [],
  locations: [],
  conditions: [],
  statuses: [],
  fundingSources: [],
})

async function loadMetadataAndAsset() {
  try {
    const [meta, fetched] = await Promise.all([
      inventoryReferenceService.fetchMetadata(),
      assetService.fetchOne(assetId),
    ])
    if (meta) {
      metadata.value = meta
    }
    if (fetched) {
      asset.value = fetched
    }
  } catch {
    toast.error('Gagal memuat detail data aset.')
  } finally {
    isLoadingAsset.value = false
  }
}

onMounted(() => {
  void loadMetadataAndAsset()
})

async function handleSave(payload: AssetSavePayload) {
  isSaving.value = true
  const updated = await assetService.update(assetId, payload)
  isSaving.value = false
  if (updated) void router.push({ name: 'inventory-assets' })
}

function handleCancel() {
  void router.push({ name: 'inventory-assets' })
}

const isUnitSaving = ref(false)

async function reloadAsset() {
  try {
    const fresh = await assetService.fetchOne(assetId)
    if (fresh) asset.value = fresh
  } catch {
    // non-blocking
  }
}

async function addOneUnit() {
  const first = asset.value?.units?.[0]
  if (!first) {
    toast.error('Tidak ada unit acuan untuk default kondisi/status/lokasi.')
    return
  }
  isUnitSaving.value = true
  const added = await assetService.addUnit(assetId, {
    conditionId: first.conditionId,
    statusId: first.statusId,
    locationId: first.locationId,
  })
  isUnitSaving.value = false
  if (added) await reloadAsset()
}

async function removeUnit(unitId: string) {
  isUnitSaving.value = true
  const removed = await assetService.removeUnit(unitId)
  isUnitSaving.value = false
  if (removed) await reloadAsset()
}

const isUnitEditOpen = ref(false)
const editingUnitId = ref<string | null>(null)
const unitForm = reactive({
  conditionId: '',
  statusId: '',
  locationId: '',
  barcode: '',
  notes: '',
})

function openEditUnit(u: InventoryAssetUnit) {
  editingUnitId.value = u.id
  unitForm.conditionId = u.conditionId
  unitForm.statusId = u.statusId
  unitForm.locationId = u.locationId
  unitForm.barcode = u.barcode ?? ''
  unitForm.notes = u.notes ?? ''
  isUnitEditOpen.value = true
}

async function saveUnit() {
  if (!editingUnitId.value) return
  isUnitSaving.value = true
  const saved = await assetService.updateUnit(editingUnitId.value, {
    conditionId: unitForm.conditionId,
    statusId: unitForm.statusId,
    locationId: unitForm.locationId,
    barcode: unitForm.barcode || undefined,
    notes: unitForm.notes || undefined,
  })
  isUnitSaving.value = false
  if (!saved) return
  isUnitEditOpen.value = false
  await reloadAsset()
}

const labelSheetRef = ref<{ print: () => Promise<void> } | null>(null)
const printUnits = ref<LabelUnit[]>([])
/**
 * What it is being printed on, and nothing else.
 *
 * There is one label size. Paper only decides how many fit on a sheet, so the
 * same asset comes off the guillotine the same size whether the tray held A4
 * or A3.
 */
const paperSize = ref(DEFAULT_PAPER_ID)

/** Said out loud: it is the number that decides how much paper to load. */
const sheetPlan = computed(() => labelSheetLayout(paperSize.value))

async function printLabels(units: InventoryAssetUnit[]) {
  if (units.length === 0) return
  printUnits.value = units.map((u) => ({
    id: u.id,
    unitNumber: u.unitNumber,
    assetName: asset.value?.name ?? '',
  }))
  await nextTick()
  await labelSheetRef.value?.print()
}

// --- Unit selection for batch label printing ---
const selectedUnits = ref<InventoryAssetUnit[]>([])

function handleUnitSelectionChange(rows: InventoryAssetUnit[]) {
  selectedUnits.value = rows
}

function printSelectedUnits() {
  void printLabels(selectedUnits.value)
}

const unitColumns = computed(() =>
  createUnitColumns({
    isSaving: isUnitSaving.value,
    canDelete: (asset.value?.units?.length ?? 0) > 1,
    onPrint: (unit) => {
      void printLabels([unit])
    },
    onEdit: openEditUnit,
    onDelete: (unit) => {
      void removeUnit(unit.id)
    },
  }),
)
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8 w-full">
    <!-- Main Form Card -->
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader class="flex flex-row items-center gap-4 border-b px-6 py-5">
        <Button
          variant="outline"
          size="icon"
          @click="handleCancel"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight"
            >Ubah Detail Aset</CardTitle
          >
          <p class="text-sm text-muted-foreground mt-1">
            Sesuaikan informasi detail aset logistik sekolah di bawah ini.
          </p>
        </div>
      </CardHeader>
      <CardContent class="p-6">
        <div
          v-if="isLoadingAsset"
          class="flex items-center justify-center py-12"
        >
          <span class="text-muted-foreground">Memuat data aset...</span>
        </div>
        <AssetForm
          v-else-if="asset"
          :asset="asset"
          :metadata="metadata"
          :is-saving="isSaving"
          @save="handleSave"
          @cancel="handleCancel"
        />
      </CardContent>
    </Card>

    <!-- Units of this asset -->
    <Card
      v-if="asset"
      class="mt-6 overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <div>
          <CardTitle class="text-lg font-bold tracking-tight">
            Unit ({{ asset.units?.length ?? 0 }})
          </CardTitle>
          <p class="text-sm text-muted-foreground mt-1">
            Tiap unit punya nomornya sendiri untuk ditempel & dipinjam.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- The arithmetic said out loud, because it is what decides how
               much paper to put in the tray. -->
          <span class="text-xs text-muted-foreground mr-1">
            {{ sheetPlan.labelsPerPage }} label/halaman
          </span>
          <Select
            :model-value="paperSize"
            @update:model-value="paperSize = String($event)"
          >
            <SelectTrigger class="w-[190px]">
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
          <Button
            v-if="selectedUnits.length > 0"
            variant="outline"
            @click="printSelectedUnits"
          >
            <Printer class="h-4 w-4 mr-2" /> Cetak Terpilih ({{
              selectedUnits.length
            }})
          </Button>
          <Button
            variant="outline"
            :disabled="!asset.units || asset.units.length === 0"
            @click="printLabels(asset.units ?? [])"
          >
            <Printer class="h-4 w-4 mr-2" /> Cetak Semua
          </Button>
          <Button
            variant="outline"
            :disabled="isUnitSaving"
            @click="addOneUnit"
          >
            <Plus class="h-4 w-4 mr-2" /> Tambah Unit
          </Button>
        </div>
      </CardHeader>
      <CardContent class="p-6">
        <DataTable
          :columns="unitColumns"
          :data="asset.units ?? []"
          :is-loading="false"
          item-label="unit"
          @selection-change="handleUnitSelectionChange"
        />
      </CardContent>
    </Card>
  </div>

  <!-- Edit unit dialog -->
  <Dialog v-model:open="isUnitEditOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Unit</DialogTitle>
        <DialogDescription>
          Perbarui kondisi, status, lokasi, dan detail unit ini.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <div class="space-y-1.5">
          <Label>Kondisi</Label>
          <Select v-model="unitForm.conditionId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih kondisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="c in metadata.conditions"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label>Status</Label>
          <Select v-model="unitForm.statusId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="s in metadata.statuses"
                :key="s.id"
                :value="s.id"
              >
                {{ s.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label>Lokasi</Label>
          <Select v-model="unitForm.locationId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih lokasi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="l in metadata.locations"
                :key="l.id"
                :value="l.id"
              >
                {{ l.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-1.5">
          <Label>Barcode</Label>
          <Input
            v-model="unitForm.barcode"
            placeholder="Opsional"
          />
        </div>

        <div class="space-y-1.5">
          <Label>Catatan</Label>
          <Textarea
            v-model="unitForm.notes"
            placeholder="Catatan unit (opsional)"
          />
        </div>
      </div>

      <DialogFooter class="gap-2">
        <Button
          type="button"
          variant="outline"
          :disabled="isUnitSaving"
          @click="isUnitEditOpen = false"
        >
          Batal
        </Button>
        <Button
          type="button"
          :disabled="isUnitSaving"
          @click="saveUnit"
        >
          {{ isUnitSaving ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <!-- Hidden print sheet (visible only when printing) -->
  <UnitLabelSheet
    ref="labelSheetRef"
    :units="printUnits"
    :paper-size="paperSize"
  />
</template>
