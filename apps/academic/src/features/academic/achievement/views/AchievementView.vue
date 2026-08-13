<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { DataTable } from '@/ui'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Label } from '@/ui/label'
import { useRoleGuard } from '@/features/platform/auth'
import { achievementTypeApi } from '@/features/platform/achievement-type'
import { createAchievementColumns } from '../components/columns'
import EditAchievementDialog from '../components/EditAchievementDialog.vue'
import { useAchievementList } from '../composables/useAchievementList'
import type { Achievement, AchievementEditData } from '../types'

/**
 * Every achievement in the school, in one place.
 *
 * Read, edit and delete only — adding one starts from the student, because an
 * achievement belongs to a person and the form needs to know which. The name in
 * each row links there.
 */
const {
  items,
  totalItems,
  loading,
  currentPage,
  pageSize,
  selectedTypeId,
  selectedYear,
  fetchAchievements,
  deleteAchievement,
  setPage,
  setPageSize,
} = useAchievementList()

const { can } = useRoleGuard()
const canManage = computed(
  () => can('achievements.update') || can('achievements.delete'),
)

const isEditOpen = ref(false)
const editingItem = ref<AchievementEditData | null>(null)
const editingProfileId = ref('')

const achievementTypes = ref<{ id: string; name: string }[]>([])
const typeFilterOptions = computed<ComboboxOption[]>(() => [
  { value: '', label: 'Semua Tingkat' },
  ...achievementTypes.value.map((t) => ({ value: t.id, label: t.name })),
])

/** The years actually present, so the filter never offers an empty one. */
const yearFilterOptions = computed<ComboboxOption[]>(() => {
  const years = [...new Set(items.value.map((a) => a.year))].sort(
    (a, b) => b - a,
  )
  return [
    { value: '', label: 'Semua Tahun' },
    ...years.map((y) => ({ value: String(y), label: String(y) })),
  ]
})

const tableColumns = computed(() =>
  createAchievementColumns(
    canManage.value,
    {
      onEdit: (item: Achievement) => {
        editingProfileId.value = item.profileId
        editingItem.value = {
          id: item.id,
          name: item.name,
          level: item.level,
          typeId: item.typeId,
          year: item.year,
          description: item.description ?? '',
        }
        isEditOpen.value = true
      },
      onDelete: (id, setLoading, closeAlert) => {
        setLoading(true)
        void deleteAchievement(id).then((result) => {
          setLoading(false)
          if (result.success) {
            closeAlert()
            void fetchAchievements()
          }
        })
      },
    },
    { showPerson: true },
  ),
)

watch([selectedTypeId, selectedYear], () => {
  currentPage.value = 1
  void fetchAchievements()
})

watch(isEditOpen, (open) => {
  if (!open) editingItem.value = null
})

onMounted(async () => {
  try {
    const res = await achievementTypeApi.getAchievementTypes({ limit: 100 })
    achievementTypes.value = res.data.data ?? []
  } catch {
    // The filter degrades to "Semua Tingkat"; the table itself still loads.
  }
  await fetchAchievements()
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
          Prestasi Siswa
        </CardTitle>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div
          class="rounded-lg border bg-muted/20 p-4 grid gap-4 sm:grid-cols-2 max-w-2xl"
        >
          <div class="grid gap-2">
            <Label>Tingkat</Label>
            <AppCombobox
              v-model="selectedTypeId"
              :options="typeFilterOptions"
              placeholder="Pilih Tingkat"
              search-placeholder="Cari tingkat..."
              empty-text="Tingkat tidak ditemukan."
            />
          </div>
          <div class="grid gap-2">
            <Label>Tahun</Label>
            <AppCombobox
              v-model="selectedYear"
              :options="yearFilterOptions"
              placeholder="Pilih Tahun"
              search-placeholder="Cari tahun..."
              empty-text="Tahun tidak ditemukan."
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
          item-label="prestasi"
          @update:page="setPage"
          @update:page-size="setPageSize"
        />

        <EditAchievementDialog
          v-if="canManage && isEditOpen"
          v-model:open="isEditOpen"
          :editing-item="editingItem"
          :profile-id="editingProfileId"
          @reload="fetchAchievements"
        />
      </div>
    </Card>
  </div>
</template>
