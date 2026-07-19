<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { authConfig } from '../config'
import { useRouter, useRoute } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { authApi } from '../api/authApi'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import AuthLogo from '../components/AuthLogo.vue'
import LoginHero from '../components/LoginHero.vue'
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const isSubmitting = ref(false)
const success = ref(false)
const token = ref<string>('')

onMounted(() => {
  const tokenVal = route.query.token as string
  if (!tokenVal) {
    toast.error('Token reset password tidak ditemukan di URL.')
  } else {
    token.value = tokenVal
  }
})

const formSchema = toTypedSchema(
  z
    .object({
      password: z.string().min(8, 'Password baru minimal harus 8 karakter.'),
      confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi.'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: 'Konfirmasi password tidak cocok.',
      path: ['confirmPassword'],
    }),
)

const { handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues: {
    password: '',
    confirmPassword: '',
  },
})

const onSubmit = handleSubmit(async (values) => {
  if (!token.value) {
    toast.error('Token reset tidak valid. Silakan ajukan ulang lupa password.')
    return
  }
  isSubmitting.value = true
  try {
    await authApi.resetPassword({
      token: token.value,
      newPassword: values.password,
    })
    success.value = true
    toast.success('Password berhasil direset')
  } catch (error) {
    toast.error(getIndonesianErrorMessage(error, 'Gagal mereset password.'))
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="grid min-h-svh lg:grid-cols-2">
    <div class="flex flex-col gap-4 bg-muted/50 p-6 md:p-10">
      <div class="hidden justify-center gap-2 lg:flex lg:justify-start">
        <router-link
          to="/login"
          class="flex items-center gap-2.5 font-semibold text-lg tracking-tight"
        >
          <AuthLogo size="sm" />
          <span>{{ authConfig.appTitle }}</span>
        </router-link>
      </div>
      <div class="flex flex-1 flex-col items-center justify-center gap-6">
        <div class="flex flex-col items-center gap-3 lg:hidden">
          <AuthLogo size="md" />
          <h1 class="text-xl font-bold tracking-tight">
            {{ authConfig.appTitle }}
          </h1>
        </div>
        <div class="w-full max-w-sm rounded-xl border bg-card p-8 shadow-lg">
          <div
            v-if="!token"
            class="space-y-6 text-center flex flex-col items-center"
          >
            <div
              class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2"
            >
              <AlertTriangle class="size-6" />
            </div>
            <h1 class="text-2xl font-bold">Token Tidak Valid</h1>
            <p class="text-muted-foreground text-sm">
              Tautan reset tidak memiliki token yang valid. Silakan ajukan
              kembali melalui halaman Lupa Password.
            </p>
            <Button
              class="w-full h-10 rounded-xl"
              @click="router.push('/forgot-password')"
            >
              Ke Halaman Lupa Password
            </Button>
          </div>

          <div
            v-else-if="success"
            class="space-y-6 text-center flex flex-col items-center"
          >
            <div
              class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2"
            >
              <CheckCircle2 class="size-6" />
            </div>
            <h1 class="text-2xl font-bold">Reset Sukses</h1>
            <p class="text-muted-foreground text-sm">
              Password Anda telah berhasil diperbarui. Silakan login kembali
              menggunakan password baru Anda.
            </p>
            <Button
              class="w-full h-10 rounded-xl font-semibold"
              @click="router.push('/login')"
            >
              Masuk Sekarang
            </Button>
          </div>

          <form
            v-else
            class="space-y-6"
            @submit.prevent="onSubmit"
          >
            <div class="flex flex-col items-center gap-1 text-center">
              <h1 class="text-2xl font-bold">Reset Password</h1>
              <p class="text-muted-foreground text-sm text-balance">
                Masukkan password baru Anda untuk memulihkan akses akun
              </p>
            </div>

            <FormField
              v-slot="{ componentField }"
              name="password"
            >
              <FormItem>
                <FormLabel for="password"> Password Baru </FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
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
                <FormLabel for="confirmPassword">
                  Konfirmasi Password
                </FormLabel>
                <FormControl>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Masukkan ulang password baru"
                    v-bind="componentField"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <Button
              type="submit"
              :disabled="isSubmitting"
              class="w-full cursor-pointer h-10 rounded-xl font-semibold"
            >
              <Loader2
                v-if="isSubmitting"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isSubmitting ? 'Mereset...' : 'Simpan Password Baru' }}
            </Button>
          </form>
        </div>
      </div>
    </div>
    <LoginHero />
  </div>
</template>
