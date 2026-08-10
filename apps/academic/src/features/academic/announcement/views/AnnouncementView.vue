<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { DataTable } from '@/ui'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { Input } from '@/ui/input'
import { Plus, Search } from 'lucide-vue-next'
import { useAnnouncement } from '../composables/useAnnouncement'
import { useRoleGuard } from '@/features/platform/auth'
import { createAnnouncementColumns } from '../components/columns'
import AnnouncementFormSheet from '../components/AnnouncementFormSheet.vue'
import type { Announcement, AnnouncementSavePayload } from '../types'

const {
  items,
  totalItems,
  currentPage,
  pageSize,
  loading,
  isSaving,
  formError,
  classrooms,
  selectedClassroomId,
  searchQuery,
  fetchFilterOptions,
  fetchAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  setPage,
  setPageSize,
} = useAnnouncement()

const isAddModalOpen = ref(false)
const editingItem = ref<Announcement | null>(null)
const { can } = useRoleGuard()
const canManageAnnouncements = computed(
  () =>
    can('announcements.create') ||
    can('announcements.update') ||
    can('announcements.delete'),
)

const classroomFilterOptions = computed<ComboboxOption[]>(() => [
  { value: '', label: 'Semua Kelas' },
  ...classrooms.value.map((c) => ({
    value: c.id,
    label: c.code ?? '-',
  })),
])

const tableColumns = createAnnouncementColumns({
  showActions: can('announcements.update') || can('announcements.delete'),
  canUpdate: can('announcements.update'),
  canDelete: can('announcements.delete'),
  onEdit: (item: Announcement) => {
    editingItem.value = item
    isAddModalOpen.value = true
  },
  onDelete: async (item: Announcement, { closeAlert, setLoading }) => {
    setLoading(true)
    const result = await deleteAnnouncement(item.id)
    setLoading(false)
    if (result.success) {
      closeAlert()
    }
  },
})

async function handleSaveAnnouncement(payload: AnnouncementSavePayload) {
  const result = await saveAnnouncement(editingItem.value?.id ?? null, payload)
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

watch(selectedClassroomId, () => {
  currentPage.value = 1
  void fetchAnnouncements()
})

watchDebounced(
  searchQuery,
  () => {
    currentPage.value = 1
    void fetchAnnouncements()
  },
  { debounce: 300 },
)

onMounted(async () => {
  await fetchFilterOptions()
  await fetchAnnouncements()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Pengumuman
        </CardTitle>
        <Button
          v-if="can('announcements.create')"
          @click="isAddModalOpen = true"
        >
          <Plus class="size-4 mr-2" />
          Tambah
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div class="rounded-lg border bg-muted/20 p-4 max-w-md">
          <div class="grid gap-2">
            <Label>Kelas</Label>
            <AppCombobox
              v-model="selectedClassroomId"
              :options="classroomFilterOptions"
              placeholder="Pilih Kelas"
              search-placeholder="Cari kelas..."
              empty-text="Kelas tidak ditemukan."
            />
          </div>
        </div>

        <DataTable
          :columns="tableColumns"
          :data="items"
          :is-loading="loading"
          :total-items="totalItems"
          :page="currentPage"
          :page-size="pageSize"
          item-label="pengumuman"
          @update:page="setPage"
          @update:page-size="setPageSize"
        >
          <template #header-right>
            <div class="relative w-full sm:w-[240px]">
              <Search
                class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                v-model="searchQuery"
                placeholder="Cari pengumuman..."
                class="pl-9 h-8 w-full text-sm"
              />
            </div>
          </template>
        </DataTable>

        <AnnouncementFormSheet
          v-if="canManageAnnouncements && isAddModalOpen"
          v-model:open="isAddModalOpen"
          :form-error="formError"
          :is-saving="isSaving"
          :edit-data="editingItem"
          :classrooms="classrooms"
          @save="handleSaveAnnouncement"
        />
      </div>
    </Card>
  </div>
</template>
