<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type { Teacher } from '../types'
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
  editData: Teacher | null
  isSaving: boolean
  formError: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'toggle-active': [isActive: boolean]
  'change-password': [newPassword: string]
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
  const newIsActive = values.isActive === 'true'
  const currentIsActive = props.editData?.user?.isActive ?? true

  if (newIsActive !== currentIsActive) {
    emit('toggle-active', newIsActive)
  }

  if (values.password) {
    emit('change-password', values.password)
  }

  if (newIsActive === currentIsActive && !values.password) {
    open.value = false
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Kelola Akun Pegawai</DialogTitle>
        <DialogDescription>
          Perbarui status akses atau atur ulang kata sandi untuk
          <strong>{{ editData?.user?.profile?.name || 'Pegawai' }}</strong
          >. Biarkan kolom kata sandi kosong jika tidak ingin mengubahnya.
        </DialogDescription>
      </DialogHeader>

      <form
        class="grid gap-4 py-4"
        @submit.prevent="onSubmit"
      >
        <div class="grid gap-2">
          <FormLabel>Username</FormLabel>
          <Input
            disabled
            :value="editData?.user?.identifier"
            class="bg-muted text-muted-foreground"
          />
        </div>

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
          <FormItem class="mt-2">
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
