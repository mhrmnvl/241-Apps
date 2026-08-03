<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { RefreshCw } from 'lucide-vue-next'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { permissionsApi } from '../api/permissionsApi'
import { getColumns } from '../components/permissionColumns'
import type { Permission } from '../types'

const permissions = ref<Permission[]>([])
const isLoading = ref(false)
const isSyncing = ref(false)

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

const columns = getColumns()

onMounted(() => {
  void fetchPermissions()
})
</script>

<template>
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
  </div>
</template>
