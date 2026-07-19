<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { getColumns } from '../components/columns'
import { useUserRole } from '../composables/useUserRole'
import { userRoleApi } from '../api/userRoleApi'

import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'

const {
  users,
  isLoading,
  paginationMeta,
  currentFilters,
  fetchTableData,
  handleUpdateFilters,
} = useUserRole()

const allRoles = ref<{ id: string; code: string; name: string }[]>([])
const columns = computed(() => getColumns(allRoles.value))

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Kelola Pengguna', href: '/pengaturan/kelola-pengguna' },
]

onMounted(async () => {
  void fetchTableData()
  try {
    const res = await userRoleApi.getRoles()
    allRoles.value = res.data?.data ?? []
  } catch (err) {
    toast.error(getIndonesianErrorMessage(err, 'Gagal memuat data role.'))
  }
})

const handlePageChange = (page: number) => {
  handleUpdateFilters({ ...currentFilters.value, page })
}

const handleRoleFilterChange = (val: string) => {
  const roleCode = val === 'ALL' ? undefined : val
  handleUpdateFilters({ ...currentFilters.value, roleCode, page: 1 })
}
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
              Kelola Pengguna
            </CardTitle>
          </div>
        </CardHeader>

        <div class="p-6">
          <DataTable
            :columns="columns"
            :data="users"
            :is-loading="isLoading"
            :total-items="paginationMeta.total"
            item-label="pengguna"
            @update:page="handlePageChange"
          >
            <template #header-right>
              <div class="flex items-center gap-2">
                <span class="text-xs text-muted-foreground whitespace-nowrap">
                  Filter Role:
                </span>
                <Select
                  :model-value="currentFilters.roleCode ?? 'ALL'"
                  @update:model-value="
                    (val) => handleRoleFilterChange(val as string)
                  "
                >
                  <SelectTrigger class="h-8 w-44">
                    <SelectValue placeholder="Semua Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Role</SelectItem>
                    <SelectItem
                      v-for="role in allRoles"
                      :key="role.id"
                      :value="role.code"
                    >
                      {{ role.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </template>
          </DataTable>
        </div>
      </Card>
    </div>
  </AppLayout>
</template>
