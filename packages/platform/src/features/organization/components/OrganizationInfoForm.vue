<script setup lang="ts">
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type { Organization } from '../types'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'

const props = defineProps<{
  draftOrganization: Organization
  formError: string | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  save: []
  'update:draftOrganization': [value: Organization]
}>()

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Nama yayasan wajib diisi.'),
    code: z.string().min(1, 'Kode yayasan wajib diisi.'),
    email: z
      .string()
      .email('Format email tidak valid.')
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
    phoneNumber: z
      .string()
      .nullable()
      .or(z.literal(''))
      .transform((val) => (val === '' ? null : val)),
  }),
)

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: '',
    code: '',
    email: '',
    phoneNumber: '',
  },
})

watch(
  () => props.draftOrganization,
  (newVal) => {
    form.resetForm({
      values: {
        name: newVal.name || '',
        code: newVal.code || '',
        email: newVal.email || '',
        phoneNumber: newVal.phoneNumber || '',
      },
    })
  },
  { immediate: true, deep: true },
)

const onSave = form.handleSubmit((values) => {
  emit('update:draftOrganization', {
    ...props.draftOrganization,
    name: values.name,
    code: values.code,
    email: values.email,
    phoneNumber: values.phoneNumber,
  })
  emit('save')
})
</script>

<template>
  <div>
    <div class="px-6 py-6">
      <div class="grid gap-4 md:grid-cols-2">
        <FormField
          v-slot="{ componentField }"
          name="name"
        >
          <FormItem class="content-start">
            <FormLabel
              >Nama Yayasan / Organisasi
              <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan nama yayasan"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="code"
        >
          <FormItem class="content-start">
            <FormLabel
              >Kode Yayasan <span class="text-destructive">*</span></FormLabel
            >
            <FormControl>
              <Input
                placeholder="Masukkan kode yayasan"
                v-bind="componentField"
                disabled
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="phoneNumber"
        >
          <FormItem class="content-start">
            <FormLabel>No. Telepon</FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan nomor telepon"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ componentField }"
          name="email"
        >
          <FormItem class="content-start">
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input
                placeholder="Masukkan email yayasan"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <p
        v-if="formError"
        class="text-sm font-medium text-destructive mt-4"
      >
        {{ formError }}
      </p>
    </div>

    <div
      class="px-6 py-4 border-t bg-muted/20 shrink-0 flex items-center justify-end"
    >
      <Button
        type="button"
        variant="default"
        :disabled="isSaving"
        @click="onSave"
      >
        <div
          v-if="isSaving"
          class="size-4 mr-2 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"
        />
        {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </Button>
    </div>
  </div>
</template>
