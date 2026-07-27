<script setup lang="ts">
import { Checkbox } from '@/ui/checkbox'
import { Separator } from '@/ui/separator'
import type { MenuSection } from '@/shared/types/menu.types'
import { menuItemKey } from '@/shared/types/menu.types'
import { useMenuVisibility } from '../composables/useMenuVisibility'

defineProps<{
  menuSections: MenuSection[]
}>()

const hiddenMenuKeys = defineModel<string[]>({ required: true })

const {
  toggleMenuKey,
  isSectionAllVisible,
  isSectionSomeVisible,
  toggleSectionAll,
} = useMenuVisibility(hiddenMenuKeys)
</script>

<template>
  <div
    class="rounded-xl border bg-card text-card-foreground shadow-xs p-6 space-y-4 col-span-1 md:col-span-2"
  >
    <h3 class="text-lg font-bold text-foreground">Visibilitas Menu</h3>
    <Separator />
    <div class="max-h-[400px] overflow-y-auto pr-2 space-y-4">
      <div
        v-for="section in menuSections"
        :key="section.label"
        class="border border-border/60 rounded-xl bg-card overflow-hidden shadow-xs transition-all duration-200"
      >
        <!-- Section Header -->
        <div
          class="flex items-center justify-between px-4 py-3 bg-muted/10 border-b cursor-pointer select-none"
          @click="toggleSectionAll(section)"
        >
          <div class="flex items-center gap-3">
            <Checkbox
              :model-value="
                isSectionAllVisible(section)
                  ? true
                  : isSectionSomeVisible(section)
                    ? 'indeterminate'
                    : false
              "
              @click.stop
              @update:model-value="() => toggleSectionAll(section)"
            />
            <span class="font-semibold text-sm">{{ section.label }}</span>
          </div>
        </div>

        <!-- Items Grid -->
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-card/50">
          <template
            v-for="item in section.items"
            :key="item.title"
          >
            <!-- Main Item Card -->
            <div
              class="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/40 cursor-pointer transition-colors"
              @click="toggleMenuKey(menuItemKey(item))"
            >
              <Checkbox
                :model-value="!hiddenMenuKeys.includes(menuItemKey(item))"
                class="mt-0.5"
                @click.stop
                @update:model-value="() => toggleMenuKey(menuItemKey(item))"
              />
              <div class="space-y-0.5 select-none">
                <div class="text-xs font-semibold tracking-tight">
                  {{ item.title }}
                </div>
                <div
                  class="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]"
                  :title="item.url"
                >
                  {{ item.url }}
                </div>
              </div>
            </div>

            <!-- Sub Items if exist -->
            <template v-if="item.items && item.items.length > 0">
              <div
                v-for="sub in item.items"
                :key="sub.url"
                class="flex items-start gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/40 cursor-pointer transition-colors bg-muted/5"
                @click="toggleMenuKey(menuItemKey(sub))"
              >
                <Checkbox
                  :model-value="!hiddenMenuKeys.includes(menuItemKey(sub))"
                  class="mt-0.5"
                  @click.stop
                  @update:model-value="() => toggleMenuKey(menuItemKey(sub))"
                />
                <div class="space-y-0.5 select-none">
                  <div
                    class="text-xs font-semibold tracking-tight flex items-center gap-1.5"
                  >
                    {{ sub.title }}
                    <span
                      class="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground font-semibold"
                      >Sub</span
                    >
                  </div>
                  <div
                    class="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]"
                    :title="sub.url"
                  >
                    {{ sub.url }}
                  </div>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
