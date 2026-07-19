<script setup lang="ts">
import { ref } from 'vue'
import { authConfig } from '../config'
import { useRouter } from 'vue-router'
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
import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const isSubmitting = ref(false)
const successMessage = ref<string | null>(null)
const debugToken = ref<string | null>(null)

const formSchema = toTypedSchema(
  z.object({
    identifier: z.string().min(1, 'ID Pengguna wajib diisi.'),
  }),
)

const { handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues: {
    identifier: '',
  },
})

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true
  successMessage.value = null
  debugToken.value = null
  try {
    const res = await authApi.forgotPassword({ identifier: values.identifier })
    const msg = res.data?.message
    successMessage.value = Array.isArray(msg)
      ? msg.join(', ')
      : (msg ?? 'Instruksi reset password telah dikirim ke email Anda.')
    if (res.data && 'debugToken' in res.data) {
      debugToken.value =
        (res.data as { debugToken?: string }).debugToken ?? null
    }
    toast.success('Permintaan reset password berhasil diajukan')
  } catch (error) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal mengajukan reset password.'),
    )
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
            v-if="successMessage"
            class="space-y-6"
          >
            <div class="flex flex-col items-center gap-2 text-center">
              <div
                class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-500 mb-2"
              >
                <CheckCircle2 class="size-6" />
              </div>
              <h1 class="text-2xl font-bold">Email Terkirim</h1>
              <p class="text-muted-foreground text-sm">
                {{ successMessage }}
              </p>
            </div>

            <!-- Dev mode link helper -->
            <div
              v-if="debugToken"
              class="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2"
            >
              <p class="font-bold flex items-center gap-1">
                <AlertCircle class="size-4" /> [DEVELOPMENT MODE]
              </p>
              <p>
                Email tidak terkirim karena Resend API tidak diaktifkan, gunakan
                token ini untuk reset password:
              </p>
              <router-link
                :to="`/reset-password?token=${debugToken}`"
                class="block underline text-primary font-semibold truncate hover:text-primary/80"
              >
                Reset Password Tautan
              </router-link>
            </div>

            <Button
              variant="outline"
              class="w-full h-10 rounded-xl"
              @click="router.push('/login')"
            >
              <ArrowLeft class="mr-2 h-4 w-4" /> Kembali ke Login
            </Button>
          </div>

          <form
            v-else
            class="space-y-6"
            @submit.prevent="onSubmit"
          >
            <div class="flex flex-col items-center gap-1 text-center">
              <h1 class="text-2xl font-bold">Lupa Password?</h1>
              <p class="text-muted-foreground text-sm text-balance">
                Masukkan ID Pengguna Anda untuk menerima tautan reset password
              </p>
            </div>

            <FormField
              v-slot="{ componentField }"
              name="identifier"
            >
              <FormItem>
                <FormLabel for="identifier"> ID Pengguna </FormLabel>
                <FormControl>
                  <Input
                    id="identifier"
                    type="text"
                    placeholder="Masukkan NIS / NIP / Username"
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
              {{ isSubmitting ? 'Memproses...' : 'Kirim Tautan Reset' }}
            </Button>

            <Button
              type="button"
              variant="ghost"
              class="w-full h-10 rounded-xl text-muted-foreground"
              @click="router.push('/login')"
            >
              Kembali ke Login
            </Button>
          </form>
        </div>
      </div>
    </div>
    <LoginHero />
  </div>
</template>
