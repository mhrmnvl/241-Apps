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
  <div class="max-w-xl py-4">
    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-medium text-slate-900">Ubah Password</h3>
        <p class="text-sm text-muted-foreground">
          Perbarui password akun Anda secara berkala untuk menjaga keamanan
          data.
        </p>
      </div>

      <form
        class="space-y-4"
        @submit.prevent="onSubmit"
      >
        <FormField
          v-slot="{ componentField }"
          name="currentPassword"
        >
          <FormItem>
            <FormLabel
              >Password Saat Ini
              <span class="text-destructive">*</span></FormLabel
            >
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
          <FormItem>
            <FormLabel
              >Password Baru <span class="text-destructive">*</span></FormLabel
            >
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
          <FormItem>
            <FormLabel
              >Konfirmasi Password Baru
              <span class="text-destructive">*</span></FormLabel
            >
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

        <div class="pt-2 flex justify-end">
          <Button
            type="submit"
            :disabled="isSubmitting"
            class="w-full sm:w-auto h-10 px-6 rounded-xl font-semibold shadow-md active:scale-[0.98] transition-transform"
          >
            <Loader2
              v-if="isSubmitting"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Ubah Password
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
