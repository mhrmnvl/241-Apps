<script setup lang="ts">
import { computed } from 'vue'
import { Badge } from '@/ui/badge'
import { STATUS_LABELS, type AdmissionStatus } from '../types'
import { STATUS_BADGE_VARIANTS } from '../utils'

const props = defineProps<{ status: AdmissionStatus }>()

const label = computed(() => STATUS_LABELS[props.status] ?? props.status)
const variant = computed(() => STATUS_BADGE_VARIANTS[props.status] ?? 'outline')
</script>

<template>
  <Badge :variant="variant">{{ label }}</Badge>
</template>
