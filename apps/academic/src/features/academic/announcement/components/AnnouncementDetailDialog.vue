<script setup lang="ts">
import { computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import { Pencil } from 'lucide-vue-next'
import type { Announcement } from '../types'

const props = withDefaults(
  defineProps<{
    open: boolean
    announcement: Announcement | null
    canManage?: boolean
  }>(),
  { canManage: false },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [announcement: Announcement]
}>()

const postedOn = computed(() =>
  props.announcement?.date ? new Date(props.announcement.date) : null,
)

/** The weekday on its own row, as the school writes a notice. */
const dayLabel = computed(
  () => postedOn.value?.toLocaleDateString('id-ID', { weekday: 'long' }) ?? '-',
)

const dateLabel = computed(
  () =>
    postedOn.value?.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) ?? '-',
)

/**
 * Who it was posted to, as one line of text.
 *
 * Joined rather than rendered as a row of badges: a badge row wraps according
 * to the width it is given, and the dialog is still growing into its own width
 * while it opens. Text that re-wraps mid-animation is what reads as the layout
 * moving.
 *
 * An announcement addressed to no class is addressed to the school — the
 * absence is the meaning, so it is spelled out rather than left blank.
 */
const audienceLabel = computed(() => {
  const names = (props.announcement?.classrooms ?? [])
    .map((c) => c.classroom?.code ?? c.classroom?.name)
    .filter((label): label is string => Boolean(label))

  return names.length > 0 ? names.join(', ') : 'Semua Kelas'
})

function handleEdit() {
  if (props.announcement) {
    emit('edit', props.announcement)
    emit('update:open', false)
  }
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="(val) => emit('update:open', val)"
  >
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-4 border-b shrink-0">
        <DialogTitle>Detail Pengumuman</DialogTitle>
      </DialogHeader>

      <!--
        A fixed label column, one field per row, every line the same height —
        the same shape as Detail Agenda, and for the same reason. The first
        version put the date and the classes side by side in a wrapping flex
        row, and `DialogContent` opens with a `zoom-in-95` animation: the box
        grows from 95% to full width, the wrapping changes as it grows, and the
        text visibly jumps into place. Nothing here re-wraps on width.
      -->
      <div class="px-6 py-5 space-y-3.5 text-xs">
        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Judul</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-semibold text-foreground break-words leading-5"
          >
            {{ announcement?.title || '-' }}
          </span>
        </div>

        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Hari</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5"
          >
            {{ dayLabel }}
          </span>
        </div>

        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Tanggal</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5"
          >
            {{ dateLabel }}
          </span>
        </div>

        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Kelas</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5"
          >
            {{ audienceLabel }}
          </span>
        </div>

        <div class="flex items-start gap-2">
          <span class="w-[115px] shrink-0 font-medium text-foreground leading-5"
            >Deskripsi</span
          >
          <span class="font-medium text-foreground shrink-0 leading-5">:</span>
          <span
            class="flex-1 min-w-0 font-medium text-foreground break-words leading-5 whitespace-pre-wrap"
          >
            {{ announcement?.description || '-' }}
          </span>
        </div>
      </div>

      <DialogFooter
        v-if="canManage"
        class="px-6 py-4 border-t shrink-0 flex flex-row items-center justify-end"
      >
        <Button
          size="sm"
          @click="handleEdit"
        >
          <Pencil class="size-3.5 mr-1.5" />
          Ubah Pengumuman
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
