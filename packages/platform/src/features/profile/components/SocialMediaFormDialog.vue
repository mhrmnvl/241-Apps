<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, useFieldArray } from 'vee-validate'
import { onMounted, watch, computed } from 'vue'
import * as z from 'zod'

import { ref } from 'vue'
import { profileConfig } from '../config'
import { Button } from '@/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { FormControl, FormField, FormItem, FormMessage } from '@/ui/form'
import { Input } from '@/ui/input'
import { AppCombobox } from '@/ui'
import type { ComboboxOption } from '@/ui'
import { Loader2, Plus, Trash2 } from 'lucide-vue-next'
import type { SocialMediaItem } from '../types'

const props = defineProps<{
  open: boolean
  isLoading?: boolean
  initialData?: SocialMediaItem | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [
    data: { items: { id?: string; platformId: string; username: string }[] },
  ]
}>()

const socialMedias = ref<any[]>([
  { id: 'Instagram', name: 'Instagram' },
  { id: 'Facebook', name: 'Facebook' },
  { id: 'Twitter', name: 'Twitter' },
  { id: 'YouTube', name: 'YouTube' },
  { id: 'TikTok', name: 'TikTok' },
  { id: 'WhatsApp', name: 'WhatsApp' },
  { id: 'Telegram', name: 'Telegram' },
  { id: 'LinkedIn', name: 'LinkedIn' },
])
const isPlatformLoading = ref(false)

const platformOptions = computed<ComboboxOption[]>(() =>
  socialMedias.value.map((p) => ({ value: p.id, label: p.name })),
)

onMounted(async () => {
  if (profileConfig.value.socialMediaProvider) {
    isPlatformLoading.value = true
    try {
      socialMedias.value = await profileConfig.value.socialMediaProvider()
    } catch (e) {
      console.error(e)
    } finally {
      isPlatformLoading.value = false
    }
  }
})

const formSchema = toTypedSchema(
  z.object({
    items: z
      .array(
        z.object({
          id: z.string().optional(),
          platformId: z.string().min(1, 'Platform wajib dipilih'),
          username: z
            .string()
            .min(1, 'Username wajib diisi')
            .max(100, 'Maksimal 100 karakter'),
        }),
      )
      .min(1, 'Minimal satu sosial media'),
  }),
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    items: [
      {
        platformId: '',
        username: '',
      },
    ],
  },
})

const fieldArray = useFieldArray('items')
const fields = fieldArray.fields
const pushField = (...args: Parameters<typeof fieldArray.push>) =>
  fieldArray.push(...args)
const removeField = (...args: Parameters<typeof fieldArray.remove>) =>
  fieldArray.remove(...args)

watch(
  () => [props.open, props.initialData],
  ([isOpen, data]) => {
    if (isOpen) {
      if (
        data &&
        (data as SocialMediaItem).socialMedias &&
        (data as SocialMediaItem).socialMedias.length > 0
      ) {
        form.resetForm({
          values: {
            items: (data as SocialMediaItem).socialMedias.map((sm) => ({
              id: sm.id,
              platformId: sm.platformId || '',
              username: sm.username || '',
            })),
          },
        })
      } else {
        form.resetForm({
          values: {
            items: [
              {
                platformId: '',
                username: '',
              },
            ],
          },
        })
      }
    }
  },
  { immediate: true },
)

const onSubmit = form.handleSubmit((values) => {
  emit('submit', values)
})
</script>

<template>
  <Sheet
    :open="open"
    @update:open="$emit('update:open', $event)"
  >
    <SheetContent
      class="w-full sm:max-w-xl md:max-w-2xl flex flex-col p-0 overflow-y-auto"
    >
      <SheetHeader class="px-6 py-6 border-b shrink-0">
        <SheetTitle
          >{{ initialData?.socialMedias?.length ? 'Edit' : 'Tambah' }} Sosial
          Media</SheetTitle
        >
        <SheetDescription>
          Kelola informasi akun sosial media di bawah ini. Anda dapat
          menambahkan lebih dari satu akun sekaligus.
        </SheetDescription>
      </SheetHeader>

      <form
        class="px-6 pb-6 mt-6"
        @submit.prevent="onSubmit"
      >
        <div class="flex flex-col gap-4">
          <div
            v-for="(field, index) in fields"
            :key="field.key"
            class="flex items-start gap-4"
          >
            <FormField
              v-slot="{ componentField }"
              :name="`items[${index}].platformId`"
            >
              <FormItem class="w-2/5">
                <FormControl>
                  <AppCombobox
                    :model-value="(componentField.modelValue as string) ?? ''"
                    :options="platformOptions"
                    :disabled="isPlatformLoading"
                    placeholder="Platform"
                    search-placeholder="Cari platform..."
                    empty-text="Platform tidak ditemukan."
                    @update:model-value="
                      componentField['onUpdate:modelValue']?.($event)
                    "
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
            <FormField
              v-slot="{ componentField }"
              :name="`items[${index}].username`"
            >
              <FormItem class="flex-1">
                <FormControl>
                  <Input
                    placeholder="@username / url profile"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="shrink-0 text-red-500 hover:text-red-600"
              :disabled="fields.length === 1"
              @click="removeField(index)"
            >
              <Trash2 class="h-4 w-4" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            class="w-full mt-2"
            @click="pushField({ platformId: '', username: '' })"
          >
            <Plus class="mr-2 h-4 w-4" />
            Tambah Sosial Media Lainnya
          </Button>
        </div>

        <SheetFooter class="mt-8 flex-col gap-2 w-full p-0">
          <Button
            type="button"
            variant="outline"
            class="w-full"
            :disabled="isLoading"
            @click="$emit('update:open', false)"
          >
            Batal
          </Button>
          <Button
            type="submit"
            class="w-full"
            :disabled="isLoading"
          >
            <Loader2
              v-if="isLoading"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Simpan
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
