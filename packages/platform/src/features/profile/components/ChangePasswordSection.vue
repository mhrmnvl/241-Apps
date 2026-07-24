<script setup lang="ts">
import { ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { changePasswordSchema } from '../schemas/change-password.schema'
import { authApi } from '@/features/platform/auth'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Loader2 } from 'lucide-vue-next'

const isSubmitting = ref(false)

const formSchema = toTypedSchema(changePasswordSchema)

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  },
})

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  try {
    await authApi.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
    toast.success(
      'Password berhasil diubah. Sesi di perangkat lain telah dicabut.',
    )
    resetForm()
  } catch (error) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal mengubah password.'))
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="py-4">
    <form
      class="space-y-4"
      @submit.prevent="onSubmit"
    >
      <FormField
        v-slot="{ componentField }"
        name="currentPassword"
      >
        <FormItem class="space-y-1.5">
          <FormLabel class="text-xs font-semibold text-foreground">
            Password Saat Ini
            <span class="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Masukkan password saat ini"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField
        v-slot="{ componentField }"
        name="newPassword"
      >
        <FormItem class="space-y-1.5">
          <FormLabel class="text-xs font-semibold text-foreground">
            Password Baru
            <span class="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Masukkan password baru (minimal 8 karakter)"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField
        v-slot="{ componentField }"
        name="confirmPassword"
      >
        <FormItem class="space-y-1.5">
          <FormLabel class="text-xs font-semibold text-foreground">
            Konfirmasi Password Baru
            <span class="text-destructive">*</span>
          </FormLabel>
          <FormControl>
            <Input
              type="password"
              placeholder="Masukkan kembali password baru"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <div class="flex justify-end pt-4">
        <Button
          type="submit"
          :disabled="isSubmitting"
        >
          <Loader2
            v-if="isSubmitting"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ isSubmitting ? 'Menyimpan...' : 'Ubah Password' }}
        </Button>
      </div>
    </form>
  </div>
</template>
