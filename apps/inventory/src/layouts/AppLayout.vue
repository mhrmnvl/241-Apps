<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/ui/breadcrumb'
import { Button } from '@/ui/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Separator } from '@/ui/separator'
import { SidebarProvider, SidebarTrigger } from '@/ui/sidebar'
import { TooltipProvider } from '@/ui/tooltip'
import { useAuthSession } from '@/features/platform/auth'
import { menuSections } from '@/config/menuConfig'
import { KeyRound, LogOut, Search, UserRound } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import type { BreadcrumbItemType } from '@/shared/types/breadcrumb.types'
import { toast } from 'vue-sonner'
import { computed, reactive, ref } from 'vue'

const { user, logoutUser, changePassword } = useAuthSession()
const router = useRouter()
const openSearch = ref(false)

const isPasswordDialogOpen = ref(false)
const isChangingPassword = ref(false)
const passwordForm = reactive({
  password: '',
  confirmPassword: '',
})
const passwordErrors = reactive<Record<string, string>>({})

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  TEACHER: 'Guru',
  STUDENT: 'Siswa',
}

const displayName = computed(() => {
  const currentUser = user.value
  return (
    currentUser?.profile?.name?.trim() ??
    currentUser?.name?.trim() ??
    currentUser?.student?.name?.trim() ??
    currentUser?.teacher?.name?.trim() ??
    'Pengguna'
  )
})

const displayRole = computed(() => {
  const roles = user.value?.roles ?? []
  if (roles.length === 0) return 'Akun'
  return roles.map((r) => ROLE_LABELS[r] ?? r).join(', ')
})

const userData = computed(() => ({
  name: displayName.value,
  email: displayRole.value,
  avatar: user.value?.profile?.avatar ?? '',
}))

const initials = computed(() => {
  return (
    userData.value.name
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?'
  )
})

function openPasswordDialog() {
  resetPasswordForm()
  isPasswordDialogOpen.value = true
}

function resetPasswordForm() {
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  Object.keys(passwordErrors).forEach((k) => delete passwordErrors[k])
}

function validatePasswordForm() {
  const errors: Record<string, string> = {}

  if (!passwordForm.password) {
    errors.password = 'Password baru wajib diisi.'
  } else if (passwordForm.password.length < 6) {
    errors.password = 'Password baru minimal 6 karakter.'
  }

  if (!passwordForm.confirmPassword) {
    errors.confirmPassword = 'Konfirmasi password wajib diisi.'
  }

  if (passwordForm.confirmPassword !== passwordForm.password) {
    errors.confirmPassword = 'Konfirmasi password belum sama.'
  }

  Object.assign(passwordErrors, errors)
  Object.keys(passwordErrors).forEach((key) => {
    if (!(key in errors)) delete passwordErrors[key]
  })

  return Object.keys(errors).length === 0
}

async function handleChangePassword() {
  if (!validatePasswordForm()) return

  const userId = user.value?.id
  if (!userId) {
    toast.error('Sesi tidak valid', {
      description: 'Silakan login ulang sebelum mengganti password.',
    })
    return
  }

  isChangingPassword.value = true
  try {
    const result = await changePassword(userId, {
      password: passwordForm.password,
    })
    if (result.success) {
      isPasswordDialogOpen.value = false
      resetPasswordForm()
    }
  } finally {
    isChangingPassword.value = false
  }
}

async function handleLogout() {
  await logoutUser()
  await router.push({ name: 'login' })
}

function handleViewProfile() {
  void router.push({ name: 'profile-view' })
}

withDefaults(
  defineProps<{
    breadcrumbs?: BreadcrumbItemType[]
  }>(),
  {
    breadcrumbs: () => [],
  },
)

const searchGroups = computed(() => {
  return menuSections.flatMap((section) =>
    section.items.map((group) => ({
      heading: group.title,
      items: group.items
        ? group.items.map((item) => ({ title: item.title, url: item.url }))
        : [{ title: group.title, url: group.url }],
    })),
  )
})
</script>

<template>
  <SidebarProvider>
    <TooltipProvider :delay-duration="100">
      <AppSidebar />
      <main
        class="relative flex w-full flex-1 flex-col bg-background overflow-hidden h-svh content-container"
      >
        <header
          class="flex h-14 shrink-0 items-center gap-2 transition-[width,height] ease-linear border-b bg-card"
        >
          <div class="flex items-center gap-2 px-4">
            <SidebarTrigger class="-ml-1" />
            <Separator
              orientation="vertical"
              class="mr-2 data-[orientation=vertical]:h-4"
            />
            <slot name="breadcrumb">
              <Breadcrumb>
                <BreadcrumbList>
                  <template v-if="breadcrumbs && breadcrumbs.length > 0">
                    <template
                      v-for="(item, index) in breadcrumbs"
                      :key="index"
                    >
                      <BreadcrumbItem
                        :class="{
                          'hidden md:block': index < breadcrumbs.length - 1,
                        }"
                      >
                        <BreadcrumbPage
                          v-if="index === breadcrumbs.length - 1"
                          class="text-primary font-medium"
                        >
                          {{ item.title }}
                        </BreadcrumbPage>
                        <BreadcrumbLink
                          v-else-if="item.href"
                          :href="item.href"
                        >
                          {{ item.title }}
                        </BreadcrumbLink>
                        <span v-else>{{ item.title }}</span>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator
                        v-if="index < breadcrumbs.length - 1"
                        :class="{
                          'hidden md:block': index < breadcrumbs.length - 1,
                        }"
                      />
                    </template>
                  </template>
                </BreadcrumbList>
              </Breadcrumb>
            </slot>
          </div>
          <div class="ml-auto flex items-center gap-4 px-6 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              class="relative h-8 w-8 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              @click="openSearch = true"
            >
              <Search class="size-4" />
            </Button>

            <CommandDialog v-model:open="openSearch">
              <CommandInput placeholder="Ketik pencarian..." />
              <CommandList>
                <CommandEmpty>Tidak ada hasil yang ditemukan.</CommandEmpty>
                <CommandGroup
                  v-for="group in searchGroups"
                  :key="group.heading"
                  :heading="group.heading"
                >
                  <CommandItem
                    v-for="item in group.items"
                    :key="item.title"
                    :value="item.title"
                    @select="
                      () => {
                        router.push(item.url)
                        openSearch = false
                      }
                    "
                  >
                    {{ item.title }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>

            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button
                  variant="ghost"
                  class="relative h-8 w-8 rounded-full"
                >
                  <Avatar class="h-8 w-8 rounded-full border border-border">
                    <AvatarImage
                      :src="userData.avatar"
                      :alt="userData.name"
                    />
                    <AvatarFallback>{{ initials }}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-56"
                align="end"
                :side-offset="8"
              >
                <DropdownMenuLabel class="font-normal">
                  <div class="flex flex-col space-y-1">
                    <p class="text-sm font-semibold leading-none">
                      {{ userData.name }}
                    </p>
                    <p class="text-xs leading-none text-muted-foreground">
                      {{ userData.email }}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem @click="handleViewProfile">
                    <UserRound class="size-4 mr-2" />
                    <span>Lihat Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="openPasswordDialog">
                    <KeyRound class="size-4 mr-2" />
                    <span>Ganti Password</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  class="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  @click="handleLogout"
                >
                  <LogOut class="size-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div class="flex-1 overflow-auto min-w-0">
          <slot />
        </div>
      </main>
    </TooltipProvider>
  </SidebarProvider>

  <Dialog v-model:open="isPasswordDialogOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Ganti Password</DialogTitle>
        <DialogDescription
          >Masukkan password baru untuk akun Anda.</DialogDescription
        >
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <Label for="new-password">Password Baru</Label>
          <Input
            id="new-password"
            v-model="passwordForm.password"
            type="password"
            autocomplete="new-password"
            :class="
              passwordErrors.password
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            "
            @input="delete passwordErrors.password"
          />
          <p
            v-if="passwordErrors.password"
            class="text-xs text-destructive"
          >
            {{ passwordErrors.password }}
          </p>
        </div>

        <div class="grid gap-2">
          <Label for="confirm-password">Konfirmasi Password</Label>
          <Input
            id="confirm-password"
            v-model="passwordForm.confirmPassword"
            type="password"
            autocomplete="new-password"
            :class="
              passwordErrors.confirmPassword
                ? 'border-destructive focus-visible:ring-destructive'
                : ''
            "
            @input="delete passwordErrors.confirmPassword"
          />
          <p
            v-if="passwordErrors.confirmPassword"
            class="text-xs text-destructive"
          >
            {{ passwordErrors.confirmPassword }}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          :disabled="isChangingPassword"
          @click="isPasswordDialogOpen = false"
        >
          Batal
        </Button>
        <Button
          :disabled="isChangingPassword"
          @click="handleChangePassword"
        >
          {{ isChangingPassword ? 'Menyimpan...' : 'Simpan Password' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
