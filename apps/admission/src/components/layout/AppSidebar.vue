<script setup lang="ts">
import type { SidebarProps } from '@/ui/sidebar'

import { useAuthSession } from '@/features/platform/auth'
import NavMain from './NavMain.vue'
import { ScrollArea } from '@/ui/scroll-area'
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
import type { UserRole } from '@/shared/types/router'
import { computed, onMounted } from 'vue'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'sidebar',
  collapsible: 'icon',
})

const { user, syncAuthenticatedUserProfile } = useAuthSession()

const userRoles = computed(() => user.value?.roles ?? [])
const isSuperAdmin = computed(() => userRoles.value.includes('SUPER_ADMIN'))

const filteredSections = computed<MenuSection[]>(() => {
  if (isSuperAdmin.value) return menuSections

  const roles = userRoles.value
  const hasRole = (r: UserRole) => roles.includes(r)
  return menuSections
    .filter((section: MenuSection) => {
      if (!section.allowedRoles || section.allowedRoles.length === 0)
        return true
      return section.allowedRoles.some(hasRole)
    })
    .map((section: MenuSection) => {
      const filteredItems = section.items
        .filter((item: MenuItem) => {
          if (!item.allowedRoles || item.allowedRoles.length === 0) return true
          return item.allowedRoles.some(hasRole)
        })
        .map((item: MenuItem) => {
          if (!item.items) return item
          const filteredSubs = item.items.filter((sub: SubMenuItem) => {
            if (!sub.allowedRoles || sub.allowedRoles.length === 0) return true
            return sub.allowedRoles.some(hasRole)
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
})
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
      <ScrollArea class="h-full w-full">
        <NavMain :sections="filteredSections" />
      </ScrollArea>
    </SidebarContent>
  </Sidebar>
</template>
