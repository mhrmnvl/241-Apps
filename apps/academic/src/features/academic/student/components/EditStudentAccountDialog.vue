<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type {
  StudentAccountUpdatePayload,
  StudentAccountEditData,
} from '../types'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
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

const props = defineProps<{
  open: boolean
  editData: StudentAccountEditData | null
  isSaving: boolean
  formError: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [data: StudentAccountUpdatePayload]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const formSchema = toTypedSchema(
  z.object({
    isActive: z.string().default('true'),
    password: z
      .string()
      .min(8, 'Kata sandi baru harus minimal 8 karakter untuk keamanan.')
      .optional()
      .or(z.literal('')),
  }),
)

const { handleSubmit, setValues } = useForm({
  validationSchema: formSchema,
  initialValues: {
    isActive: 'true',
    password: '',
  },
})

watch(
  () => props.editData,
  (data) => {
    if (data?.user) {
      setValues({
        isActive: data.user.isActive ? 'true' : 'false',
        password: '',
      })
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  const payload: StudentAccountUpdatePayload = {
    isActive: values.isActive === 'true',
  }
  if (values.password) {
    payload.password = values.password
  }

  emit('save', payload)
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Kelola Akun Siswa</DialogTitle>
        <DialogDescription>
          Perbarui status akses atau atur ulang kata sandi untuk
          <strong>{{ editData?.user?.profile?.name || 'Siswa' }}</strong
          >. Biarkan kolom kata sandi kosong jika tidak ingin mengubahnya.
        </DialogDescription>
      </DialogHeader>

      <form
        class="grid gap-4 py-4"
        @submit.prevent="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="password"
        >
          <FormItem>
            <FormLabel>Password Baru</FormLabel>
            <FormControl>
              <Input
                type="password"
                placeholder="Kosongkan jika tidak diubah"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ value, handleChange }"
          name="isActive"
        >
          <FormItem>
            <FormLabel>Status Akun</FormLabel>
            <Select
              :model-value="value"
              @update:model-value="handleChange"
            >
              <FormControl>
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="true"> Aktif </SelectItem>
                <SelectItem value="false"> Nonaktif </SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </FormField>

        <p
          v-if="formError"
          class="text-xs font-medium text-destructive mt-1"
        >
          {{ formError }}
        </p>

        <DialogFooter>
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
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
