<script setup lang="ts">
import type { DisplayItem, Organization } from '../types'
import { formatValue } from '../utils'
import {
  Building,
  Mail,
  Phone,
  QrCode,
  ToggleLeft,
  ToggleRight,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { Badge } from '@/ui/badge'

const props = defineProps<{
  organization: Organization
  isLoading: boolean
  loadError: string | null
}>()

const organizationItems = computed<DisplayItem[]>(() => [
  {
    label: 'Nama Yayasan / Organisasi',
    value: formatValue(props.organization.name),
    icon: Building,
  },
  {
    label: 'Kode Yayasan',
    value: formatValue(props.organization.code),
    icon: QrCode,
  },
  {
    label: 'No. Telepon',
    value: formatValue(props.organization.phoneNumber),
    icon: Phone,
  },
  {
    label: 'Email',
    value: formatValue(props.organization.email),
    icon: Mail,
  },
])
</script>

<template>
  <div class="p-6">
    <div
      v-if="isLoading"
      class="py-12 text-center text-sm text-muted-foreground"
    >
      Memuat data yayasan...
    </div>
    <div
      v-else-if="loadError"
      class="rounded-lg border border-dashed p-6 text-center"
    >
      <p class="text-sm text-muted-foreground">
        {{ loadError }}
      </p>
    </div>
    <div
      v-else
      class="space-y-6"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <div
          v-for="item in organizationItems"
          :key="item.label"
          class="rounded-lg border bg-background p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-xs font-medium text-muted-foreground">
              {{ item.label }}
            </p>
            <component
              :is="item.icon"
              class="mt-0.5 size-4 shrink-0 text-muted-foreground"
            />
          </div>
          <p class="mt-2 text-sm leading-6 font-medium text-foreground">
            {{ item.value }}
          </p>
        </div>
      </div>

      <div class="rounded-xl border bg-muted/20 p-5">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Status Keaktifan</p>
            <div class="mt-2 flex items-center gap-2">
              <Badge :variant="organization.isActive ? 'default' : 'secondary'">
                {{ organization.isActive ? 'Aktif' : 'Non-aktif' }}
              </Badge>
            </div>
          </div>
          <component
            :is="organization.isActive ? ToggleRight : ToggleLeft"
            class="size-6 text-muted-foreground"
          />
        </div>
      </div>
    </div>
  </div>
</template>
