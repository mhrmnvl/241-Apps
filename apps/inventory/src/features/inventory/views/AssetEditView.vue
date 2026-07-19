<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { inventoryApi } from '../api/inventoryApi'
import type {
  InventoryAsset,
  InventoryMetadata,
  AssetSavePayload,
} from '../types'
import AssetForm from '../components/AssetForm.vue'
import { Button } from '@/ui'
import { ChevronLeft } from 'lucide-vue-next'

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

const breadcrumbs = [
  { title: 'Inventaris', href: '/inventory/assets' },
  { title: 'Daftar Aset', href: '/inventory/assets' },
  { title: 'Ubah Detail Aset' },
]

async function loadMetadataAndAsset() {
  try {
    const [metaRes, assetRes] = await Promise.all([
      inventoryApi.getInventoryMetadata(),
      inventoryApi.getAssetById(assetId),
    ])
    if (metaRes.data?.data) {
      metadata.value = metaRes.data.data
    }
    if (assetRes.data?.data) {
      asset.value = assetRes.data.data
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
  try {
    await inventoryApi.updateAsset(assetId, payload)
    toast.success('Detail data aset berhasil diperbarui.')
    void router.push({ name: 'inventory-assets' })
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memperbarui data aset.'))
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  void router.push({ name: 'inventory-assets' })
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
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
    </div>
  </AppLayout>
</template>
