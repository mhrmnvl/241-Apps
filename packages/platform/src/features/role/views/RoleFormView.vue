<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { ArrowLeft } from 'lucide-vue-next'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { rolesApi } from '../api/rolesApi'
import RoleForm from '../components/RoleForm.vue'
import type {
  Role,
  Permission,
  CreateRolePayload,
  UpdateRolePayload,
} from '../types'

const route = useRoute()
const router = useRouter()

const roleId = computed(() => route.params.id as string | undefined)
const isEditing = computed(() => !!roleId.value)

const permissions = ref<Permission[]>([])
const selectedRole = ref<Role | null>(null)

const isLoadingPermissions = ref(false)
const isLoadingRole = ref(false)
const isSaving = ref(false)
const formError = ref<string | null>(null)

const fetchPermissions = async () => {
  isLoadingPermissions.value = true
  try {
    const res = await rolesApi.getPermissions()
    permissions.value = res.data?.data ?? []
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memuat daftar hak akses.'),
    )
  } finally {
    isLoadingPermissions.value = false
  }
}

const fetchRoleDetails = async () => {
  if (!roleId.value) return
  isLoadingRole.value = true
  try {
    const res = await rolesApi.getRoleById(roleId.value)
    selectedRole.value = res.data?.data ?? null
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memuat data detail role.'),
    )
    void router.push('/setting/role')
  } finally {
    isLoadingRole.value = false
  }
}

const handleSaveRole = async (
  payload: CreateRolePayload | UpdateRolePayload,
) => {
  isSaving.value = true
  formError.value = null
  try {
    if (isEditing.value && roleId.value) {
      await rolesApi.updateRole(roleId.value, payload)
      toast.success('Berhasil memperbarui data role')
    } else {
      await rolesApi.createRole(payload as CreateRolePayload)
      toast.success('Berhasil menambahkan role baru')
    }
    void router.push('/setting/role')
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

const handleCancel = () => {
  void router.push('/setting/role')
}

onMounted(async () => {
  await fetchPermissions()
  if (isEditing.value) {
    await fetchRoleDetails()
  }
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 flex flex-col gap-0"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 shrink-0 gap-4"
      >
        <div class="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            class="h-8 w-8"
            @click="handleCancel"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              {{ isEditing ? 'Ubah Hak Akses Role' : 'Tambah Role Baru' }}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <!-- Loading State for full page -->
      <div
        v-if="isLoadingRole"
        class="p-6 flex flex-col items-center justify-center py-20 space-y-4"
      >
        <span class="text-sm text-muted-foreground animate-pulse"
          >Memuat data detail role...</span
        >
      </div>

      <RoleForm
        v-else
        :edit-data="selectedRole"
        :is-saving="isSaving"
        :form-error="formError"
        :permissions="permissions"
        :is-loading-permissions="isLoadingPermissions"
        @save="handleSaveRole"
        @cancel="handleCancel"
      />
    </Card>
  </div>
</template>
