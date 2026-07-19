<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/ui/sidebar'
import type { MenuItem, MenuSection, SubMenuItem } from '@/config/menuConfig'
import { ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  sections: MenuSection[]
}>()

const route = useRoute()

const activeItems = computed(() => {
  const path = route.path
  const set = new Set<string>()

  for (const section of props.sections) {
    for (const item of section.items) {
      if (item.items?.some((sub: SubMenuItem) => path.startsWith(sub.url))) {
        set.add(item.title)
      }
    }
  }

  return set
})

function isItemActive(item: MenuItem): boolean {
  return activeItems.value.has(item.title)
}
</script>

<template>
  <SidebarGroup
    v-for="section in sections"
    :key="section.label"
  >
    <SidebarGroupLabel>{{ section.label }}</SidebarGroupLabel>
    <SidebarMenu>
      <Collapsible
        v-for="item in section.items"
        :key="item.title"
        as-child
        :default-open="isItemActive(item)"
        class="group/collapsible"
      >
        <SidebarMenuItem>
          <CollapsibleTrigger
            v-if="item.items?.length"
            as-child
          >
            <SidebarMenuButton :tooltip="item.title">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
              <ChevronRight
                class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <SidebarMenuButton
            v-else
            as-child
            :tooltip="item.title"
          >
            <RouterLink :to="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </RouterLink>
          </SidebarMenuButton>

          <CollapsibleContent v-if="item.items?.length">
            <SidebarMenuSub>
              <SidebarMenuSubItem
                v-for="subItem in item.items"
                :key="subItem.title"
              >
                <SidebarMenuSubButton as-child>
                  <RouterLink :to="subItem.url">
                    <span>{{ subItem.title }}</span>
                  </RouterLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
