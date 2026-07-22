<script setup lang="ts">
import EditTeacherAccountDialog from '../components/EditTeacherAccountDialog.vue'
import { useTeacher } from '../composables/useTeacher'
import type { Teacher } from '../types'
import { createAccountColumns } from '../components/columns'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
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
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { watchDebounced } from '@vueuse/core'
import { Search, Filter } from 'lucide-vue-next'
import { onMounted, ref, computed } from 'vue'
import { toast } from 'vue-sonner'
import { useRoleGuard } from '@/shared/composables/useRoleGuard'

const breadcrumbs = [
  { title: 'Guru', href: '/teacher' },
  { title: 'Akun Guru' },
]

const { can } = useRoleGuard()

const {
  filters,
  loading,
  isSaving,
  formError,
  fetchTeachers,
  filteredTeachers,
  toggleActive,
  deleteTeacher,
  changePassword,
} = useTeacher()

const isEditAccountModalOpen = ref(false)
const accountToEdit = ref<Teacher | null>(null)

const tableColumns = createAccountColumns({
  canUpdate: can('teachers.update'),
  canDelete: can('teachers.delete'),
  onEdit: (teacher) => {
    accountToEdit.value = teacher
    isEditAccountModalOpen.value = true
  },
  onDelete: async (teacher, { closeAlert, setLoading }) => {
    setLoading(true)
    try {
      await deleteTeacher(teacher.id)
      toast.success('Akun guru berhasil dihapus')
      await fetchTeachers()
      closeAlert()
    } catch (e: unknown) {
      toast.error(getIndonesianErrorMessage(e, 'Gagal menghapus akun guru'))
    } finally {
      setLoading(false)
    }
  },
})

async function handleToggleActive(isActive: boolean) {
  if (!accountToEdit.value) return
  try {
    await toggleActive(accountToEdit.value.id, isActive)
    toast.success(
      `Status akun berhasil diubah menjadi ${isActive ? 'Aktif' : 'Nonaktif'}`,
    )
    isEditAccountModalOpen.value = false
    await fetchTeachers()
  } catch (e: unknown) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal mengubah status akun guru'))
  }
}

async function handleChangePassword(newPassword: string) {
  if (!accountToEdit.value?.user?.id) return
  try {
    await changePassword({
      userId: accountToEdit.value.user.id,
      password: newPassword,
    })
    toast.success('Password akun guru berhasil diperbarui')
    isEditAccountModalOpen.value = false
  } catch (e: unknown) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal mengubah password akun guru'),
    )
  }
}
const isFilterDialogOpen = ref(false)

const activeFiltersCount = computed(() => {
  let count = 0
  if (filters.value.categoryFilter !== 'all') count++
  if (filters.value.statusFilter !== 'all') count++
  return count
})

function resetAllFilters() {
  filters.value.categoryFilter = 'all'
  filters.value.statusFilter = 'all'
}

function handleFilterChange(
  key: 'categoryFilter' | 'statusFilter',
  value: unknown,
) {
  filters.value[key] = typeof value === 'string' ? value : 'all'
}
watchDebounced(
  () => filters.value.keyword,
  () => fetchTeachers(),
  { debounce: 400 },
)

onMounted(() => {
  void fetchTeachers()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="border-b px-6 py-5 flex flex-row items-center justify-between"
        >
          <div>
            <CardTitle class="text-xl sm:text-2xl font-bold tracking-tight">
              Akun Guru
            </CardTitle>
          </div>
        </CardHeader>
        <div class="p-6 w-full">
          <!-- Filters Section matching Academic Layout -->
          <div class="mb-6">
            <!-- Desktop Layout: Inline selects -->
            <div class="hidden lg:flex lg:flex-row lg:items-center gap-3">
              <Select
                :model-value="filters.categoryFilter"
                @update:model-value="
                  handleFilterChange('categoryFilter', $event)
                "
              >
                <SelectTrigger
                  class="w-full lg:w-fit lg:min-w-[150px] px-3! gap-2!"
                >
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"> Semua Kategori </SelectItem>
                  <SelectItem value="guru"> Guru </SelectItem>
                  <SelectItem value="tendik"> Tenaga Kependidikan </SelectItem>
                </SelectContent>
              </Select>

              <Select
                :model-value="filters.statusFilter"
                @update:model-value="handleFilterChange('statusFilter', $event)"
              >
                <SelectTrigger
                  class="w-full lg:w-fit lg:min-w-[140px] px-3! gap-2!"
                >
                  <SelectValue placeholder="Status Akun" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all"> Semua Status </SelectItem>
                  <SelectItem value="active"> Aktif </SelectItem>
                  <SelectItem value="inactive"> Nonaktif </SelectItem>
                </SelectContent>
              </Select>

              <div class="relative lg:ml-auto lg:w-[240px]">
                <Search
                  class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  v-model="filters.keyword"
                  placeholder="Cari akun guru..."
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
                    placeholder="Cari akun guru..."
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
            :data="filteredTeachers"
            :total-items="filteredTeachers.length"
            :is-loading="loading"
            item-label="akun guru"
          />
        </div>
      </Card>
    </div>

    <!-- Mobile Filter Dialog -->
    <Dialog v-model:open="isFilterDialogOpen">
      <DialogContent
        class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden"
      >
        <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
          <DialogTitle>Filter Akun Guru</DialogTitle>
          <DialogDescription class="sr-only">
            Saring daftar akun guru berdasarkan kategori dan status.
          </DialogDescription>
        </DialogHeader>

        <div class="p-6 space-y-4">
          <!-- Category -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-muted-foreground"
              >Kategori</label
            >
            <Select
              :model-value="filters.categoryFilter"
              @update:model-value="handleFilterChange('categoryFilter', $event)"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"> Semua Kategori </SelectItem>
                <SelectItem value="guru"> Guru </SelectItem>
                <SelectItem value="tendik"> Tenaga Kependidikan </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Status -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-muted-foreground"
              >Status</label
            >
            <Select
              :model-value="filters.statusFilter"
              @update:model-value="handleFilterChange('statusFilter', $event)"
            >
              <SelectTrigger class="w-full">
                <SelectValue placeholder="Status Akun" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"> Semua Status </SelectItem>
                <SelectItem value="active"> Aktif </SelectItem>
                <SelectItem value="inactive"> Nonaktif </SelectItem>
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

    <EditTeacherAccountDialog
      v-model:open="isEditAccountModalOpen"
      :edit-data="accountToEdit"
      :form-error="formError"
      :is-saving="isSaving"
      @toggle-active="handleToggleActive"
      @change-password="handleChangePassword"
    />
  </AppLayout>
</template>
