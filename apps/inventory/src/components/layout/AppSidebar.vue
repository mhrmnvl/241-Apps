<script setup lang="ts">
import type { SidebarProps } from '@/ui/sidebar'

import { useAuthSession } from '@/features/platform/auth'
import NavMain from './NavMain.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'
import { menuSections } from '@/config/menuConfig'
import type { MenuSection, MenuItem, SubMenuItem } from '@/config/menuConfig'
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'sidebar',
  collapsible: 'icon',
})

const { user, syncAuthenticatedUserProfile } = useAuthSession()

const scrollContainer = ref<HTMLDivElement | null>(null)
const STORAGE_KEY = 'sidebar-scroll-position'

const userRoles = computed(() => user.value?.roles ?? [])
const userPermissions = computed(() => user.value?.permissions ?? [])
const isSuperAdmin = computed(() => userRoles.value.includes('SUPER_ADMIN'))

function canShowByPermission(required?: string): boolean {
  if (!required) return true
  if (isSuperAdmin.value) return true
  return userPermissions.value.includes(required)
}

function canShowByRole(allowed?: string[]): boolean {
  if (!allowed || allowed.length === 0) return true
  if (isSuperAdmin.value) return true
  return allowed.some((r) => userRoles.value.includes(r))
}

const filteredSections = computed<MenuSection[]>(() => {
  return menuSections
    .filter((section: MenuSection) => {
      if (section.requiredPermission)
        return canShowByPermission(section.requiredPermission)
      if (section.allowedRoles) return canShowByRole(section.allowedRoles)
      return true
    })
    .map((section: MenuSection) => {
      const filteredItems = section.items
        .filter((item: MenuItem) => {
          if (item.requiredPermission)
            return canShowByPermission(item.requiredPermission)
          if (item.allowedRoles) return canShowByRole(item.allowedRoles)
          return true
        })
        .map((item: MenuItem) => {
          if (!item.items) return item
          const filteredSubs = item.items.filter((sub: SubMenuItem) => {
            if (sub.requiredPermission)
              return canShowByPermission(sub.requiredPermission)
            if (sub.allowedRoles) return canShowByRole(sub.allowedRoles)
            return true
          })
          if (filteredSubs.length === 0 && item.items.length > 0) return null
          return { ...item, items: filteredSubs }
        })
        .filter((item: MenuItem | null): item is MenuItem => item !== null)

      if (filteredItems.length === 0) return null
      return { ...section, items: filteredItems }
    })
    .filter(
      (section: MenuSection | null): section is MenuSection => section !== null,
    )
})

onMounted(() => {
  if (user.value) {
    void syncAuthenticatedUserProfile()
  }

  const saved = sessionStorage.getItem(STORAGE_KEY)
  if (saved && scrollContainer.value) {
    scrollContainer.value.scrollTop = parseInt(saved, 10)
  }
})

function handleScroll(e: Event) {
  const target = e.target as HTMLDivElement
  sessionStorage.setItem(STORAGE_KEY, String(target.scrollTop))
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            as-child
          >
            <RouterLink to="/dashboard">
              <img
                src="/logo.webp"
                alt="SIMAS Logo"
                class="size-8 rounded-lg object-contain"
              />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold text-base">SIMAS 241</span>
                <span
                  class="truncate text-xs text-muted-foreground font-medium"
                >
                  Manajemen Aset
                </span>
              </div>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <div
        ref="scrollContainer"
        class="h-full w-full overflow-y-auto"
        @scroll="handleScroll"
      >
        <NavMain :sections="filteredSections" />
      </div>
    </SidebarContent>
  </Sidebar>
</template>
