<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus, RefreshCw } from 'lucide-vue-next'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { permissionsApi } from '../api/permissionsApi'
import { getColumns } from '../components/permissionColumns'
import PermissionFormSheet from '../components/PermissionFormSheet.vue'
import type {
  Permission,
  CreatePermissionPayload,
  UpdatePermissionPayload,
} from '../types'

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Manajemen Permission', href: '/pengaturan/permissions' },
]

const permissions = ref<Permission[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isSyncing = ref(false)
const formError = ref<string | null>(null)

const isSheetOpen = ref(false)
const selectedPermission = ref<Permission | null>(null)

const fetchPermissions = async () => {
  isLoading.value = true
  try {
    const res = await permissionsApi.getPermissions()
    permissions.value = res.data?.data ?? []
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memuat data permission.'),
    )
  } finally {
    isLoading.value = false
  }
}

const handleAddClick = () => {
  selectedPermission.value = null
  formError.value = null
  isSheetOpen.value = true
}

const handleEditClick = (permission: Permission) => {
  selectedPermission.value = permission
  formError.value = null
  isSheetOpen.value = true
}

const handleDelete = async (
  permission: Permission,
  {
    closeAlert,
    setLoading,
  }: { closeAlert: () => void; setLoading: (state: boolean) => void },
) => {
  setLoading(true)
  try {
    await permissionsApi.deletePermission(permission.id)
    toast.success('Berhasil menghapus permission')
    closeAlert()
    await fetchPermissions()
  } catch (error) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus permission.'))
  } finally {
    setLoading(false)
  }
}

const handleSave = async (
  payload: CreatePermissionPayload | UpdatePermissionPayload,
) => {
  isSaving.value = true
  formError.value = null
  try {
    if (selectedPermission.value) {
      await permissionsApi.updatePermission(
        selectedPermission.value.id,
        payload as UpdatePermissionPayload,
      )
      toast.success('Berhasil memperbarui permission')
    } else {
      await permissionsApi.createPermission(payload as CreatePermissionPayload)
      toast.success('Berhasil menambahkan permission baru')
    }
    isSheetOpen.value = false
    await fetchPermissions()
  } catch (error) {
    formError.value = getIndonesianErrorMessage(
      error,
      'Gagal menyimpan permission.',
    )
    toast.error(formError.value)
  } finally {
    isSaving.value = false
  }
}

const handleSync = async () => {
  isSyncing.value = true
  try {
    await permissionsApi.syncPermissions()
    toast.success('Katalog permission tersinkron dengan definisi backend.')
    await fetchPermissions()
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal menyinkronkan permission.'),
    )
  } finally {
    isSyncing.value = false
  }
}

const columns = getColumns(handleEditClick, handleDelete)

onMounted(() => {
  void fetchPermissions()
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
              Manajemen Permission
            </CardTitle>
          </div>
          <div class="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <Button
              variant="outline"
              class="w-full sm:w-auto"
              :disabled="isSyncing"
              @click="handleSync"
            >
              <RefreshCw
                class="mr-2 h-4 w-4"
                :class="{ 'animate-spin': isSyncing }"
              />
              {{ isSyncing ? 'Menyinkronkan...' : 'Sinkronkan' }}
            </Button>
            <Button
              class="w-full sm:w-auto"
              @click="handleAddClick"
            >
              <Plus class="mr-2 h-4 w-4" /> Tambah Permission
            </Button>
          </div>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="permissions"
            :is-loading="isLoading"
            item-label="permission"
          />
        </div>
      </Card>

      <PermissionFormSheet
        v-if="isSheetOpen"
        v-model:open="isSheetOpen"
        :edit-data="selectedPermission"
        :is-saving="isSaving"
        :form-error="formError"
        @save="handleSave"
      />
    </div>
  </AppLayout>
</template>
