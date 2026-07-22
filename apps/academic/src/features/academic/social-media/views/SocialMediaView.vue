<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Plus, Trash } from 'lucide-vue-next'
import { getColumns } from '../components/columns'
import { useSocialMedia } from '../composables/useSocialMedia'
import SocialMediaFormDialog from '../components/SocialMediaFormDialog.vue'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'
import AppLayout from '@/layouts/AppLayout.vue'

const {
  socialMedias,
  isLoading,
  paginationMeta,
  currentFilters,
  openForm,
  fetchTableData,
  handleUpdateFilters,
  deleteBulk,
} = useSocialMedia()
const { can } = useRoleGuard()
const columns = getColumns(
  can('social-media.update') || can('social-media.delete'),
)
const selectedIds = ref<string[]>([])

onMounted(() => {
  void fetchTableData()
})

const handleAdd = () => {
  openForm()
}

const handlePageChange = (page: number) => {
  handleUpdateFilters({ ...currentFilters.value, page })
}

const handleSearch = (search: string) => {
  handleUpdateFilters({ ...currentFilters.value, search, page: 1 })
}

const handleBulkDelete = async () => {
  if (!selectedIds.value.length) return
  if (
    confirm(
      `Apakah Anda yakin ingin menghapus ${selectedIds.value.length} socialMedia?`,
    )
  ) {
    const success = await deleteBulk(selectedIds.value)
    if (success) {
      selectedIds.value = []
    }
  }
}
</script>

<template>
  <AppLayout>
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight"
              >SocialMedia Sosial Media</CardTitle
            >
          </div>
          <div
            v-if="can('social-media.create')"
            class="flex gap-2"
          >
            <Button
              v-if="selectedIds.length > 0"
              variant="destructive"
              @click="handleBulkDelete"
            >
              <Trash class="w-4 h-4 mr-2" />
              Hapus ({{ selectedIds.length }})
            </Button>
            <Button @click="handleAdd">
              <Plus class="w-4 h-4 mr-2" />
              Tambah
            </Button>
          </div>
        </CardHeader>

        <div class="p-6 space-y-4">
          <DataTable
            v-model:selected-ids="selectedIds"
            :columns="columns"
            :data="socialMedias"
            :loading="isLoading"
            :pagination="paginationMeta"
            search-placeholder="Cari socialMedia..."
            @update:page="handlePageChange"
            @search="handleSearch"
          />
        </div>
      </Card>
    </div>

    <SocialMediaFormDialog v-if="can('social-media.create')" />
  </AppLayout>
</template>
