<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { DataTable } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Plus } from 'lucide-vue-next'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { rolesApi } from '../api/rolesApi'
import { getColumns } from '../components/roleColumns'
import type { Role } from '../types'

const router = useRouter()

const breadcrumbs = [
  { title: 'Pengaturan', href: '#' },
  { title: 'Manajemen Role', href: '/pengaturan/roles' },
]

const roles = ref<Role[]>([])
const isLoading = ref(false)

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
  void router.push('/pengaturan/roles/tambah')
}

const handleEditClick = (role: Role) => {
  void router.push(`/pengaturan/roles/${role.id}/edit`)
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
    </div>
  </AppLayout>
</template>
