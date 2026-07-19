<script setup lang="ts">
/**
 * Komponen: Team Switcher
 * Deskripsi: Komponen untuk memilih atau mengganti organisasi/tim aktif pada header sidebar
 *
 * Digunakan pada:
 * - AppSidebar untuk memilih sekolah/organisasi
 */
import type { Component } from 'vue'
import { School } from 'lucide-vue-next'
import { ref } from 'vue'

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/ui/sidebar'

const props = defineProps<{
  teams: {
    name: string
    logo: Component
    plan: string
  }[]
}>()

const activeTeam = ref(
  props.teams[0] ?? {
    name: 'SIAKAD 241',
    logo: School,
    plan: 'Sistem Informasi Akademik',
  },
)
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <SidebarMenuButton
        size="lg"
        class="hover:bg-transparent hover:text-sidebar-foreground cursor-default"
      >
        <div
          class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-sidebar-primary-foreground"
        >
          <component
            :is="activeTeam.logo"
            class="size-4"
          />
        </div>
        <div class="grid flex-1 text-left text-sm leading-tight">
          <span class="truncate font-medium">
            {{ activeTeam.name }}
          </span>
          <span class="truncate text-xs">{{ activeTeam.plan }}</span>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
