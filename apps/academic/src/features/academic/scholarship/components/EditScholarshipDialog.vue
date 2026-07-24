<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'

import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { useScholarship } from '../composables/useScholarship'
import type {
  ScholarshipEditData,
  ScholarshipCreatePayload,
  ScholarshipUpdatePayload,
} from '../types'
import { SCHOLARSHIP_STATUSES } from '../types'

const props = defineProps<{
  open: boolean
  editingItem?: ScholarshipEditData | null
  userId: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  reload: []
}>()

const { isSaving, saveScholarship } = useScholarship()

const open = computed({
  get: () => props.open,
  set: (v: boolean) => emit('update:open', v),
})

const isCreate = computed(() => !props.editingItem?.id)

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama beasiswa wajib diisi').max(200),
    provider: z.string().min(1, 'Penyelenggara wajib diisi').max(200),
    year: z.coerce.number().min(1900, 'Tahun tidak valid').max(2100),
    status: z.string().max(50).optional().or(z.literal('')),
  }),
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    provider: '',
    year: new Date().getFullYear(),
    status: 'Aktif',
  },
})

watch(
  () => [props.open, props.editingItem],
  ([isOpen]) => {
    if (isOpen) {
      if (props.editingItem?.id) {
        form.resetForm({
          values: {
            name: props.editingItem.name ?? '',
            provider: props.editingItem.provider ?? '',
            year: props.editingItem.year ?? new Date().getFullYear(),
            status: props.editingItem.status ?? 'Aktif',
          },
        })
      } else {
        form.resetForm({
          values: {
            name: '',
            provider: '',
            year: new Date().getFullYear(),
            status: 'Aktif',
          },
        })
      }
    }
  },
  { immediate: true },
)

const onSubmit = form.handleSubmit(async (values) => {
  const basePayload = {
    name: values.name,
    provider: values.provider,
    year: Number(values.year),
    status: (values.status ?? 'ACTIVE') as ScholarshipCreatePayload['status'],
  }

  if (isCreate.value) {
    const payload: ScholarshipCreatePayload = {
      ...basePayload,
      profileId: props.userId,
    }
    const { success } = await saveScholarship(payload, true)
    if (success) {
      open.value = false
      emit('reload')
    }
  } else {
    const payload: ScholarshipUpdatePayload = basePayload
    const { success } = await saveScholarship(
      payload,
      false,
      props.editingItem?.id,
    )
    if (success) {
      open.value = false
      emit('reload')
    }
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="w-full sm:max-w-xl flex flex-col gap-0 border-l p-0">
      <form
        class="flex flex-col h-full"
        @submit.prevent="onSubmit"
      >
        <DialogHeader class="px-6 py-6 border-b shrink-0">
          <DialogTitle class="text-xl">
            {{ isCreate ? 'Tambah Beasiswa' : 'Edit Beasiswa' }}
          </DialogTitle>
          <DialogDescription class="sr-only"> </DialogDescription>
        </DialogHeader>

        <ScrollArea class="flex-1 min-h-0">
          <div class="p-6">
            <div class="grid gap-5 md:grid-cols-2">
              <FormField
                v-slot="{ componentField }"
                name="name"
              >
                <FormItem class="md:col-span-2 content-start">
                  <FormLabel
                    >Nama Program Beasiswa
                    <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Contoh: Beasiswa Prestasi Unggulan"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="provider"
              >
                <FormItem class="content-start">
                  <FormLabel
                    >Instansi / Penyelenggara
                    <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      placeholder="Contoh: Kemendikbud"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="year"
              >
                <FormItem class="content-start">
                  <FormLabel
                    >Tahun <span class="text-destructive">*</span></FormLabel
                  >
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2024"
                      v-bind="componentField"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <FormField
                v-slot="{ componentField }"
                name="status"
              >
                <FormItem class="md:col-span-2 content-start">
                  <FormLabel>Status</FormLabel>
                  <Select v-bind="componentField">
                    <FormControl>
                      <SelectTrigger class="w-full">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        v-for="s in SCHOLARSHIP_STATUSES"
                        :key="s.value"
                        :value="s.value"
                      >
                        {{ s.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter
          class="px-6 py-4 border-t shrink-0 flex gap-2 sm:justify-end w-full bg-background relative mt-auto"
        >
          <Button
            type="button"
            variant="outline"
            :disabled="isSaving"
            @click="open = false"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="default"
            :disabled="isSaving"
          >
            {{
              isSaving
                ? 'Menyimpan...'
                : isCreate
                  ? 'Tambah'
                  : 'Simpan Perubahan'
            }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
