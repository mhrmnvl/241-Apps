<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus } from 'lucide-vue-next'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { rolesApi } from '../api/rolesApi'
import { getColumns } from '../components/roleColumns'
import RoleFormSheet from '../components/RoleFormSheet.vue'
import type { Role, CreateRolePayload, UpdateRolePayload } from '../types'

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Manajemen Role', href: '/pengaturan/roles' },
]

const roles = ref<Role[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const formError = ref<string | null>(null)

const isSheetOpen = ref(false)
const selectedRole = ref<Role | null>(null)

const fetchRoles = async () => {
  isLoading.value = true
  try {
    const res = await rolesApi.getRoles()
    roles.value = res.data?.data ?? []
  } catch (error) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal memuat data role.'))
  } finally {
    isLoading.value = false
  }
}

const handleAddClick = () => {
  selectedRole.value = null
  formError.value = null
  isSheetOpen.value = true
}

const handleEditClick = (role: Role) => {
  selectedRole.value = role
  formError.value = null
  isSheetOpen.value = true
}

const handleDeleteRole = async (
  role: Role,
  {
    closeAlert,
    setLoading,
  }: { closeAlert: () => void; setLoading: (state: boolean) => void },
) => {
  setLoading(true)
  try {
    await rolesApi.deleteRole(role.id)
    toast.success('Berhasil menghapus role')
    closeAlert()
    await fetchRoles()
  } catch (error) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus role.'))
  } finally {
    setLoading(false)
  }
}

const handleSaveRole = async (
  payload: CreateRolePayload | UpdateRolePayload,
) => {
  isSaving.value = true
  formError.value = null
  try {
    if (selectedRole.value) {
      // Update
      await rolesApi.updateRole(
        selectedRole.value.id,
        payload as UpdateRolePayload,
      )
      toast.success('Berhasil memperbarui data role')
    } else {
      // Create
      await rolesApi.createRole(payload as CreateRolePayload)
      toast.success('Berhasil menambahkan role baru')
    }
    isSheetOpen.value = false
    await fetchRoles()
  } catch (error) {
    formError.value = getIndonesianErrorMessage(
      error,
      'Gagal menyimpan data role.',
    )
    toast.error(formError.value)
  } finally {
    isSaving.value = false
  }
}

const columns = getColumns(handleEditClick, handleDeleteRole)

onMounted(() => {
  void fetchRoles()
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Manajemen Role & Hak Akses
            </CardTitle>
          </div>
          <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button
              class="w-full sm:w-auto"
              @click="handleAddClick"
            >
              <Plus class="mr-2 h-4 w-4" /> Tambah Role
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="roles"
            :is-loading="isLoading"
            item-label="role"
          />
        </div>
      </Card>

      <RoleFormSheet
        v-if="isSheetOpen"
        v-model:open="isSheetOpen"
        :edit-data="selectedRole"
        :is-saving="isSaving"
        :form-error="formError"
        @save="handleSaveRole"
      />
    </div>
  </AppLayout>
</template>
