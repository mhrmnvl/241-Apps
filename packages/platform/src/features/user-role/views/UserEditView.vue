<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { toast } from 'vue-sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { ChevronLeft, Loader2 } from 'lucide-vue-next'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { userRoleApi } from '../api/userRoleApi'
import type { UpdateUserAccountPayload } from '../types'

const route = useRoute()
const router = useRouter()
const userId = route.params.id as string

const isLoading = ref(true)
const isSaving = ref(false)
const currentIdentifier = ref('')

// Password optional: leaving it blank keeps the current one. When filled, it
// must meet the length rule and match the confirmation.
const formSchema = toTypedSchema(
  z
    .object({
      identifier: z
        .string()
        .min(3, 'Username minimal 3 karakter.')
        .max(50, 'Username maksimal 50 karakter.'),
      password: z
        .string()
        .max(100, 'Password maksimal 100 karakter.')
        .optional()
        .or(z.literal('')),
      confirmPassword: z.string().optional().or(z.literal('')),
    })
    .refine((v) => !v.password || v.password.length >= 6, {
      message: 'Password baru minimal 6 karakter.',
      path: ['password'],
    })
    .refine((v) => (v.password ?? '') === (v.confirmPassword ?? ''), {
      message: 'Konfirmasi password tidak cocok.',
      path: ['confirmPassword'],
    }),
)

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    identifier: '',
    password: '',
    confirmPassword: '',
  },
})

function goBack() {
  void router.push({ name: 'UserRole' })
}

onMounted(async () => {
  try {
    const res = await userRoleApi.getUserById(userId)
    const user = res.data?.data
    if (user) {
      currentIdentifier.value = user.identifier
      resetForm({
        values: {
          identifier: user.identifier,
          password: '',
          confirmPassword: '',
        },
      })
    }
  } catch (err) {
    toast.error(getIndonesianErrorMessage(err, 'Gagal memuat data pengguna.'))
  } finally {
    isLoading.value = false
  }
})

const onSubmit = handleSubmit(async (values) => {
  const payload: UpdateUserAccountPayload = {}
  if (values.identifier && values.identifier !== currentIdentifier.value) {
    payload.identifier = values.identifier
  }
  if (values.password && values.password.length > 0) {
    payload.password = values.password
  }

  if (Object.keys(payload).length === 0) {
    toast.info('Tidak ada perubahan untuk disimpan.')
    return
  }

  isSaving.value = true
  try {
    await userRoleApi.updateUserAccount(userId, payload)
    toast.success('Akun pengguna berhasil diperbarui.')
    goBack()
  } catch (err) {
    toast.error(getIndonesianErrorMessage(err, 'Gagal memperbarui akun.'))
  } finally {
    isSaving.value = false
  }
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8 w-full">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader class="flex flex-row items-center gap-4 border-b px-6 py-5">
        <Button
          variant="outline"
          size="icon"
          @click="goBack"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight">
            Ubah Akun Pengguna
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent class="p-6">
        <div
          v-if="isLoading"
          class="flex items-center justify-center py-12"
        >
          <span class="text-muted-foreground">Memuat data pengguna...</span>
        </div>

        <form
          v-else
          class="space-y-6"
          @submit.prevent="onSubmit"
        >
          <div
            class="rounded-xl border bg-card p-5 space-y-4 text-sm flex flex-col"
          >
            <h3 class="text-sm font-semibold">Kredensial Akun</h3>

            <FormField
              v-slot="{ componentField }"
              name="identifier"
            >
              <FormItem>
                <FormLabel
                  >Username <span class="text-destructive">*</span></FormLabel
                >
                <FormControl>
                  <Input
                    v-bind="componentField"
                    placeholder="Masukkan username"
                    :disabled="isSaving"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <FormField
                v-slot="{ componentField }"
                name="password"
              >
                <FormItem>
                  <FormLabel>Password Baru</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      v-bind="componentField"
                      placeholder="Kosongkan jika tidak diubah"
                      :disabled="isSaving"
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
                  <FormLabel>Konfirmasi Password Baru</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      v-bind="componentField"
                      placeholder="Ulangi password baru"
                      :disabled="isSaving"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              :disabled="isSaving"
              @click="goBack"
            >
              Batal
            </Button>
            <Button
              type="submit"
              :disabled="isSaving"
            >
              <Loader2
                v-if="isSaving"
                class="mr-2 h-4 w-4 animate-spin"
              />
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
