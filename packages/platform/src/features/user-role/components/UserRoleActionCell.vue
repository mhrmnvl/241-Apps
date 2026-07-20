<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { Button } from '@/ui/button'
import { Checkbox } from '@/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { ShieldCheck } from 'lucide-vue-next'
import { userRoleService } from '../services/userRoleService'
import { useUserRoleStore } from '../stores/userRoleStore'
import type { UserWithRoles } from '../types'

const props = defineProps<{
  user: UserWithRoles
  allRoles: { id: string; code: string; name: string }[]
}>()

const store = useUserRoleStore()
const { isUpdating } = storeToRefs(store)

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

const open = ref(false)
const selectedIds = ref<string[]>([])

const originalIds = computed(
  () => props.user.userRoles?.map((ur) => ur.role.id) ?? [],
)

// Seed the local selection from the user's current roles each time the
// dialog opens so it always reflects the latest server state.
watch(open, (isOpen) => {
  if (isOpen) {
    selectedIds.value = [...originalIds.value]
  }
})

const toggleRole = (roleId: string) => {
  const next = [...selectedIds.value]
  const index = next.indexOf(roleId)
  if (index > -1) {
    next.splice(index, 1)
  } else {
    next.push(roleId)
  }
  selectedIds.value = next
}

const hasChanges = computed(() => {
  const original = originalIds.value
  if (original.length !== selectedIds.value.length) return true
  return selectedIds.value.some((id) => !original.includes(id))
})

const handleSave = async () => {
  if (selectedIds.value.length === 0) {
    toast.warning('Pengguna harus memiliki minimal satu role.')
    return
  }
  const ok = await userRoleService.syncUserRoles(
    props.user.id,
    originalIds.value,
    selectedIds.value,
  )
  if (ok) {
    open.value = false
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

    <template v-else>
      <Button
        variant="outline"
        size="sm"
        class="h-8 text-xs font-semibold px-2.5"
        @click="open = true"
      >
        <ShieldCheck class="mr-1.5 size-3.5 text-muted-foreground" />
        Kelola Role
      </Button>

      <Dialog v-model:open="open">
        <DialogContent class="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Kelola Role Pengguna</DialogTitle>
            <DialogDescription>
              Tentukan role untuk
              <span class="font-semibold text-foreground">{{
                user.identifier
              }}</span
              >. Pengguna harus memiliki minimal satu role.
            </DialogDescription>
          </DialogHeader>

          <div class="space-y-2 py-2 max-h-[320px] overflow-y-auto pr-1">
            <label
              v-for="role in allRoles"
              :key="role.id"
              class="flex items-center gap-3 rounded-xl border border-border/60 p-3 hover:bg-muted/40 cursor-pointer transition-colors"
            >
              <Checkbox
                :model-value="selectedIds.includes(role.id)"
                @update:model-value="() => toggleRole(role.id)"
              />
              <div class="space-y-0.5 select-none">
                <div class="text-sm font-semibold tracking-tight">
                  {{ role.name }}
                </div>
                <div
                  class="text-[10px] text-muted-foreground font-mono uppercase"
                >
                  {{ role.code }}
                </div>
              </div>
            </label>

            <p
              v-if="allRoles.length === 0"
              class="text-center py-6 text-sm text-muted-foreground"
            >
              Tidak ada data role yang tersedia.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              :disabled="isUpdating"
              @click="open = false"
            >
              Batal
            </Button>
            <Button
              variant="default"
              :disabled="isUpdating || !hasChanges || selectedIds.length === 0"
              @click="handleSave"
            >
              <div
                v-if="isUpdating"
                class="size-4 mr-2 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"
              />
              {{ isUpdating ? 'Menyimpan...' : 'Simpan' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>
