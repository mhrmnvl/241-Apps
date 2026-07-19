<script setup lang="ts">
import { statusOptions } from '../constants'
import type {
  DisplayItem,
  SchoolUnitAddress,
  SchoolUnitProfile,
} from '../types'
import { buildFullAddress, formatValue } from '../utils'
import {
  BadgeInfo,
  Building2,
  FileBadge,
  Fingerprint,
  Globe,
  Landmark,
  Mail,
  MapPinned,
  Phone,
  School,
} from 'lucide-vue-next'
import { computed } from 'vue'

const props = defineProps<{
  schoolUnit: SchoolUnitProfile
  address: SchoolUnitAddress
  isLoading: boolean
  loadError: string | null
}>()

const statusLabel = computed(
  () =>
    statusOptions.find((option) => option.value === props.schoolUnit.status)
      ?.label ?? props.schoolUnit.status,
)

const typeLabel = computed(() => props.schoolUnit.type?.name ?? '-')

const schoolUnitItems = computed<DisplayItem[]>(() => [
  {
    label: 'Nama',
    value: formatValue(props.schoolUnit.name),
    icon: School,
  },
  {
    label: 'Nama Singkat',
    value: formatValue(props.schoolUnit.surname),
    icon: School,
  },
  { label: 'Status', value: formatValue(statusLabel.value), icon: Building2 },
  {
    label: 'NSM',
    value: formatValue(props.schoolUnit.nsm),
    icon: Fingerprint,
  },
  {
    label: 'NPSN',
    value: formatValue(props.schoolUnit.npsn),
    icon: BadgeInfo,
  },
  {
    label: 'NPWP',
    value: formatValue(props.schoolUnit.npwp),
    icon: FileBadge,
  },
  { label: 'Tipe', value: formatValue(typeLabel.value), icon: Landmark },
  {
    label: 'Telepon',
    value: formatValue(props.schoolUnit.phone),
    icon: Phone,
  },
  { label: 'Email', value: formatValue(props.schoolUnit.email), icon: Mail },
  {
    label: 'Website',
    value: formatValue(props.schoolUnit.website),
    href: props.schoolUnit.website?.trim() || undefined,
    icon: Globe,
  },
])

const fullAddress = computed(() => buildFullAddress(props.address))
</script>

<template>
  <div class="px-6 pt-4 pb-6">
    <div
      v-if="isLoading"
      class="py-12 text-center text-sm text-muted-foreground"
    >
      Memuat data unit sekolah...
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
      <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div
          v-for="item in schoolUnitItems"
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
          <a
            v-if="item.href"
            :href="item.href"
            target="_blank"
            rel="noreferrer"
            class="mt-2 inline-block text-sm leading-6 font-medium text-primary hover:underline"
          >
            {{ item.value }}
          </a>
          <p
            v-else
            class="mt-2 text-sm leading-6 font-medium text-foreground"
          >
            {{ item.value }}
          </p>
        </div>
      </div>

      <div class="rounded-xl border bg-muted/20 p-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Alamat Lengkap</p>
            <p class="mt-2 text-sm leading-7 font-medium text-foreground">
              {{ fullAddress }}
            </p>
          </div>
          <MapPinned class="mt-1 size-5 shrink-0 text-muted-foreground" />
        </div>
      </div>
    </div>
  </div>
</template>
