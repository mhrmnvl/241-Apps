<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'
import { Pencil, ShieldCheck, Settings2 } from 'lucide-vue-next'
import { useUserRole } from '../composables/useUserRole'
import { useAuthSession } from '@/features/platform/auth'
import { useRoleGuard } from '@/features/platform/auth'
import type { UserWithRoles } from '../types'

const props = defineProps<{
  user: UserWithRoles
  allRoles: { id: string; code: string; name: string }[]
}>()

const router = useRouter()
const { isUpdating, syncUserRoles } = useUserRole()
const { user: currentUser } = useAuthSession()
const { can } = useRoleGuard()

const canEditAccount = computed(() => can('users.update'))

const isSelf = computed(() => currentUser.value?.id === props.user.id)

function openEditAccount() {
  void router.push({ name: 'UserRoleEdit', params: { id: props.user.id } })
}

const open = ref(false)
const selectedIds = ref<string[]>([])

const originalIds = computed(
  () => props.user.userRoles?.map((ur) => ur.role.id) ?? [],
)

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
  const ok = await syncUserRoles(
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
    <Tooltip :delay-duration="300">
      <TooltipTrigger as-child>
        <DropdownMenu :modal="false">
          <DropdownMenuTrigger
            class="w-8 h-8 p-0 flex items-center justify-center data-[state=open]:bg-muted border-none text-muted-foreground hover:bg-muted focus:ring-0 shadow-none rounded-md outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
          >
            <span class="sr-only">Opsi</span>
            <Settings2 class="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            class="w-[190px] p-1.5 space-y-1"
          >
            <DropdownMenuItem
              v-if="canEditAccount"
              :disabled="isSelf"
              class="py-2.5 px-3"
              :class="
                isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              "
              @click="!isSelf && openEditAccount()"
            >
              <div class="flex items-center gap-3">
                <Pencil class="h-4 w-4 text-muted-foreground" />
                <span>Ubah Akun</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              :disabled="isSelf"
              class="py-2.5 px-3"
              :class="
                isSelf ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              "
              @click="!isSelf && (open = true)"
            >
              <div class="flex items-center gap-3">
                <ShieldCheck class="h-4 w-4 text-muted-foreground" />
                <span>Kelola Role</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Pilihan Aksi</p>
      </TooltipContent>
    </Tooltip>

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
  </div>
</template>
