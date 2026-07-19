<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { inventoryApi } from '../api/inventoryApi'
import type { InventoryMetadata, AssetSavePayload } from '../types'
import AssetForm from '../components/AssetForm.vue'
import { Button } from '@/ui'
import { ChevronLeft } from 'lucide-vue-next'

const router = useRouter()
const isSaving = ref(false)
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
  { title: 'Tambah Aset' },
]

async function loadMetadata() {
  try {
    const response = await inventoryApi.getInventoryMetadata()
    if (response.data?.data) {
      metadata.value = response.data.data
    }
  } catch {
    toast.error('Gagal memuat metadata referensi.')
  }
}

onMounted(() => {
  void loadMetadata()
})

async function handleSave(payload: AssetSavePayload) {
  isSaving.value = true
  try {
    await inventoryApi.createAsset(payload)
    toast.success('Aset baru berhasil ditambahkan.')
    void router.push({ name: 'inventory-assets' })
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menambahkan aset baru.'))
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
              >Tambah Aset Baru</CardTitle
            >
            <p class="text-sm text-muted-foreground mt-1">
              Isi detail data aset logistik sekolah secara lengkap.
            </p>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <AssetForm
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
