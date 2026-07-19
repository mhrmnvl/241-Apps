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
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { watchDebounced } from '@vueuse/core'
import { Search } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'

const breadcrumbs = [
  { title: 'Guru', href: '/teacher' },
  { title: 'Akun Guru' },
]

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
            <CardTitle class="text-2xl font-bold tracking-tight">
              Akun Guru
            </CardTitle>
          </div>
        </CardHeader>
        <div class="p-6 w-full">
          <div class="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
            <Select
              :model-value="filters.categoryFilter"
              @update:model-value="
                filters.categoryFilter = ($event as string | null) ?? 'all'
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
              @update:model-value="
                filters.statusFilter = ($event as string | null) ?? 'all'
              "
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
