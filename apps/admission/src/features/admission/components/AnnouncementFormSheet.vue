<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Textarea } from '@/ui/textarea'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import type {
  AdmissionAnnouncement,
  AdmissionWaveSummary,
  AnnouncementSavePayload,
} from '../types'

const ALL_WAVES = 'ALL'

const props = defineProps<{
  open: boolean
  announcement: AdmissionAnnouncement | null
  isSaving: boolean
  waves: AdmissionWaveSummary[]
}>()

const emit = defineEmits<{
  (e: 'update:open', val: boolean): void
  (e: 'save', payload: AnnouncementSavePayload): void
}>()

const isEdit = computed(() => !!props.announcement)

const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, 'Judul wajib diisi'),
    content: z.string().min(1, 'Isi pengumuman wajib diisi'),
    waveId: z.string().default(ALL_WAVES),
  }),
)

interface AnnouncementFormValues {
  title: string
  content: string
  waveId: string
}

const { handleSubmit, resetForm } = useForm<AnnouncementFormValues>({
  validationSchema: formSchema,
})

watch(
  () => [props.open, props.announcement],
  () => {
    if (!props.open) return
    resetForm({
      values: {
        title: props.announcement?.title ?? '',
        content: props.announcement?.content ?? '',
        waveId: props.announcement?.waveId ?? ALL_WAVES,
      },
    })
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  emit('save', {
    title: values.title.trim(),
    content: values.content.trim(),
    waveId: values.waveId === ALL_WAVES ? undefined : values.waveId,
  })
})
</script>

<template>
  <Sheet
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>
          {{ isEdit ? 'Ubah Pengumuman' : 'Buat Pengumuman' }}
        </SheetTitle>
        <SheetDescription>
          Pengumuman tampil di dashboard pendaftar setelah diterbitkan.
        </SheetDescription>
      </SheetHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="announcement-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="onSubmit"
        >
          <FormField
            v-slot="{ componentField }"
            name="title"
          >
            <FormItem>
              <FormLabel
                >Judul <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  v-bind="componentField"
                  placeholder="Contoh: Hasil Seleksi Gelombang 1"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="content"
          >
            <FormItem>
              <FormLabel>Isi <span class="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  rows="6"
                  placeholder="Tuliskan isi pengumuman…"
                  :disabled="isSaving"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="waveId"
          >
            <FormItem>
              <FormLabel>Gelombang</FormLabel>
              <Select
                :model-value="value"
                :disabled="isSaving"
                @update:model-value="handleChange"
              >
                <FormControl>
                  <SelectTrigger class="w-full">
                    <SelectValue placeholder="Pilih cakupan" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem :value="ALL_WAVES">Semua Gelombang</SelectItem>
                  <SelectItem
                    v-for="wave in waves"
                    :key="wave.id"
                    :value="wave.id"
                  >
                    {{ wave.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>
        </form>
      </ScrollArea>

      <SheetFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="isSaving"
          @click="emit('update:open', false)"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="announcement-form"
          :disabled="isSaving"
        >
          {{ isSaving ? 'Menyimpan…' : 'Simpan' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
