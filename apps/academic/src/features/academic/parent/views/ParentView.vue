<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { useParent } from '../composables/useParent'
import { useRoleGuard } from '@/features/platform/auth'
import { createParentColumns } from '../components/columns'
import ParentFormDialog from '../components/ParentFormDialog.vue'
import type { Parent, ParentSavePayload } from '../types'

const breadcrumbs = [
  { title: 'Data Master', href: '#' },
  { title: 'Data Orang Tua', href: '/data/parent' },
]

const {
  items,
  totalItems,
  loading,
  isSaving,
  formError,
  occupations,
  searchQuery,
  selectedOccupationId,
  fetchFilterOptions,
  fetchParents,
  saveParent,
  deleteParent,
} = useParent()

const isAddModalOpen = ref(false)
const editingItem = ref<Parent | null>(null)
const { can } = useRoleGuard()
const canManageParents = computed(
  () => can('parents.create') || can('parents.update') || can('parents.delete'),
)

const occupationFilterOptions = computed<ComboboxOption[]>(() => [
  { value: '', label: 'Semua Pekerjaan' },
  ...occupations.value.map((o) => ({
    value: o.id,
    label: o.name,
  })),
])

const tableColumns = createParentColumns({
  showActions: can('parents.update') || can('parents.delete'),
  canUpdate: can('parents.update'),
  canDelete: can('parents.delete'),
  onEdit: (item: Parent) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: Parent, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteParent(item.id)
    setLoading(false)
    if (result.success) {
      closeAlert()
    }
  },
})

async function handleSaveParent(payload: ParentSavePayload) {
  const result = await saveParent(editingItem.value?.id ?? null, payload)
  if (result.success) {
    isAddModalOpen.value = false
  }
}

watch(isAddModalOpen, (isOpen) => {
  if (!isOpen) {
    editingItem.value = null
    formError.value = null
  }
})

watch([selectedOccupationId, searchQuery], () => {
  void fetchParents()
})

onMounted(async () => {
  await fetchFilterOptions()
  await fetchParents()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <CardTitle class="text-2xl font-bold tracking-tight">
            Data Orang Tua
          </CardTitle>
          <Button
            v-if="can('parents.create')"
            @click="isAddModalOpen = true"
          >
            <Plus class="size-4 mr-2" />
            Tambah
          </Button>
        </CardHeader>

        <div class="p-6 space-y-6">
          <div class="rounded-lg border bg-muted/20 p-4 max-w-md">
            <div class="grid gap-2">
              <Label>Pekerjaan</Label>
              <AppCombobox
                v-model="selectedOccupationId"
                :options="occupationFilterOptions"
                placeholder="Pilih Pekerjaan"
                search-placeholder="Cari pekerjaan..."
                empty-text="Pekerjaan tidak ditemukan."
              />
            </div>
          </div>

          <DataTable
            :columns="tableColumns"
            :data="items"
            :total-items="totalItems"
            :is-loading="loading"
            item-label="orang tua"
          >
            <template #header-right>
              <div class="relative w-full sm:w-[240px]">
                <Search
                  class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  v-model="searchQuery"
                  placeholder="Cari orang tua..."
                  class="pl-9 h-8 w-full text-sm"
                />
              </div>
            </template>
          </DataTable>

          <ParentFormDialog
            v-if="canManageParents && isAddModalOpen"
            v-model:open="isAddModalOpen"
            :form-error="formError"
            :is-saving="isSaving"
            :edit-data="editingItem"
            :occupations="occupations"
            @save="handleSaveParent"
          />
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
