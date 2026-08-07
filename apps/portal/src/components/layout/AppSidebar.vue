<script setup lang="ts">
import type { SidebarProps } from '@/ui/sidebar'

import { useAuthSession } from '@/features/platform/auth'
import { useBranding, useSettingsStore } from '@/features/platform/settings'
import { useMenuVisibility } from '@/composables/useMenuVisibility'
import NavMain from './NavMain.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/ui/sidebar'
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'sidebar',
  collapsible: 'icon',
})

const { user, syncAuthenticatedUserProfile } = useAuthSession()
const { filteredSections } = useMenuVisibility()
const { logoSrc } = useBranding()
const settingsStore = useSettingsStore()
const appTitle = computed(() => settingsStore.settings?.appTitle ?? 'PSB 241')

const scrollContainer = ref<HTMLDivElement | null>(null)
const STORAGE_KEY = 'sidebar-scroll-position'

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
                :src="logoSrc"
                :alt="appTitle"
                class="size-8 rounded-lg object-contain"
              />
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold text-base">{{
                  appTitle
                }}</span>
                <span
                  class="truncate text-xs text-muted-foreground font-medium"
                >
                  Penerimaan Santri Baru
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
        class="h-full w-full overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
        @scroll="handleScroll"
      >
        <NavMain :sections="filteredSections" />
      </div>
    </SidebarContent>
  </Sidebar>
</template>
