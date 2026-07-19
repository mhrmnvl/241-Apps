<script setup lang="ts">
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/ui/dropdown-menu'
import { ChevronDown } from 'lucide-vue-next'
import { userRoleService } from '../services/userRoleService'
import type { UserWithRoles } from '../types'

const props = defineProps<{
  user: UserWithRoles
  allRoles: { id: string; code: string; name: string }[]
  isUpdating: boolean
}>()

const isSelf = computed(() => {
  const stored = window.localStorage.getItem('siakad_user')
  if (stored) {
    try {
      const user = JSON.parse(stored) as { id?: string }
      return user.id === props.user.id
    } catch {
      return false
    }
  }
  return false
})

const isAssigned = (roleId: string) => {
  return props.user.roles?.some((r) => r.id === roleId) ?? false
}

const handleToggleRole = async (
  role: { id: string; code: string; name: string },
  checked: boolean,
) => {
  if (checked) {
    await userRoleService.assignRole(role.id, props.user.id)
  } else {
    // Prevent removing the last role
    const currentRolesCount = props.user.roles?.length ?? 0
    if (currentRolesCount <= 1) {
      toast.warning('Pengguna harus memiliki minimal satu role.')
      return
    }
    await userRoleService.unassignRole(role.id, props.user.id)
  }
}
</script>

<template>
  <div class="flex items-center gap-2">
    <Button
      v-if="isSelf"
      variant="ghost"
      size="sm"
      disabled
      class="cursor-not-allowed"
    >
      Akun Anda
    </Button>

    <DropdownMenu
      v-else
      :modal="false"
    >
      <DropdownMenuTrigger as-child>
        <Button
          variant="outline"
          size="sm"
          :disabled="isUpdating"
          class="h-8 text-xs font-semibold px-2.5"
        >
          Kelola Role
          <ChevronDown class="ml-1.5 size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-48 align-end">
        <DropdownMenuCheckboxItem
          v-for="role in allRoles"
          :key="role.id"
          :checked="isAssigned(role.id)"
          @update:checked="
            (checked: boolean) => handleToggleRole(role, checked)
          "
        >
          {{ role.name }}
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>
