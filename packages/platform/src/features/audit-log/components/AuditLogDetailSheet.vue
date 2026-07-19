<script setup lang="ts">
import { computed } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { ScrollArea } from '@/ui/scroll-area'
import { Button } from '@/ui/button'
import { Separator } from '@/ui/separator'
import { Badge } from '@/ui/badge'
import {
  FileJson,
  Clipboard,
  User,
  Calendar,
  Network,
  Terminal,
  CheckCircle2,
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { AuditLog } from '../types'

const props = defineProps<{
  open: boolean
  log: AuditLog | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const formatIndonesianDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date
    .toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(/\./g, ':')
}

const formattedMetadata = computed(() => {
  if (!props.log?.metadata) return null
  try {
    return JSON.stringify(props.log.metadata, null, 2)
  } catch {
    return String(props.log.metadata)
  }
})

const getActionVariant = (action: string) => {
  const lower = action.toLowerCase()
  if (
    lower.includes('create') ||
    lower.includes('store') ||
    lower.includes('add')
  )
    return 'default'
  if (
    lower.includes('update') ||
    lower.includes('edit') ||
    lower.includes('patch')
  )
    return 'outline'
  if (
    lower.includes('delete') ||
    lower.includes('destroy') ||
    lower.includes('remove')
  )
    return 'destructive'
  return 'secondary'
}

const copyToClipboard = () => {
  if (!formattedMetadata.value) return
  void navigator.clipboard.writeText(formattedMetadata.value)
  toast.success('Metadata disalin ke papan klip')
}
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent class="w-full sm:max-w-lg flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle class="text-xl font-bold">
          Detail Log Aktivitas
        </SheetTitle>
        <SheetDescription>
          Rincian log aktivitas sistem dan riwayat perubahan data.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <div class="p-6 space-y-6">
          <div
            v-if="log"
            class="space-y-4"
          >
            <!-- Action Badge & Time -->
            <div class="flex items-center justify-between">
              <Badge
                :variant="getActionVariant(log.action)"
                class="capitalize font-semibold text-xs py-1 px-3"
              >
                {{ log.action }}
              </Badge>
              <div
                class="flex items-center gap-1.5 text-xs text-muted-foreground"
              >
                <Calendar class="size-3.5" />
                {{ formatIndonesianDateTime(log.createdAt) }}
              </div>
            </div>

            <Separator />

            <!-- Information Grid -->
            <div class="grid grid-cols-1 gap-4 text-sm">
              <div class="grid grid-cols-3 items-start gap-1">
                <span
                  class="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 py-0.5"
                >
                  <User class="size-3.5" /> Pengguna
                </span>
                <span class="col-span-2 font-medium break-all">
                  {{ log.user?.identifier ?? 'Sistem / Anonim' }}
                </span>
              </div>

              <div class="grid grid-cols-3 items-start gap-1">
                <span
                  class="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 py-0.5"
                >
                  <FileJson class="size-3.5" /> Modul / Entitas
                </span>
                <span
                  class="col-span-2 font-mono text-xs font-semibold bg-muted px-2 py-0.5 rounded w-fit border"
                >
                  {{ log.resource }}
                </span>
              </div>

              <div
                v-if="log.resourceId"
                class="grid grid-cols-3 items-start gap-1"
              >
                <span
                  class="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 py-0.5"
                >
                  <CheckCircle2 class="size-3.5" /> ID Resource
                </span>
                <span
                  class="col-span-2 font-mono text-xs text-muted-foreground break-all"
                >
                  {{ log.resourceId }}
                </span>
              </div>

              <div class="grid grid-cols-3 items-start gap-1">
                <span
                  class="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 py-0.5"
                >
                  <Network class="size-3.5" /> IP Address
                </span>
                <span class="col-span-2 font-mono text-xs">
                  {{ log.ipAddress ?? '-' }}
                </span>
              </div>

              <div class="grid grid-cols-3 items-start gap-1">
                <span
                  class="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 py-0.5"
                >
                  <Terminal class="size-3.5" /> User Agent
                </span>
                <span
                  class="col-span-2 text-xs text-muted-foreground wrap-break-word leading-relaxed"
                >
                  {{ log.userAgent ?? '-' }}
                </span>
              </div>
            </div>

            <Separator />

            <!-- Metadata section -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span
                  class="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                >
                  <FileJson class="size-3.5" /> Detail Data (Metadata)
                </span>
                <Button
                  v-if="formattedMetadata"
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="h-7 text-xs gap-1.5"
                  @click="copyToClipboard"
                >
                  <Clipboard class="size-3" />
                  Salin JSON
                </Button>
              </div>

              <div class="rounded-xl border bg-muted/40 overflow-hidden">
                <pre
                  v-if="formattedMetadata"
                  class="p-4 text-[11px] font-mono overflow-auto max-h-[350px] leading-relaxed text-foreground select-all"
                  >{{ formattedMetadata }}</pre
                >
                <div
                  v-else
                  class="p-6 text-center text-xs text-muted-foreground"
                >
                  Tidak ada rincian data metadata untuk aktivitas ini.
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div class="p-4 border-t bg-background shrink-0 flex justify-end">
        <Button
          variant="outline"
          @click="open = false"
          >Tutup</Button
        >
      </div>
    </SheetContent>
  </Sheet>
</template>
