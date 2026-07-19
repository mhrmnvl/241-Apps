<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Button } from '@/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/card'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import type { ActiveWave } from '../types'
import { formatIDR } from '../utils'

const router = useRouter()

const waves = ref<ActiveWave[]>([])
const loadingWaves = ref(true)
const isSubmitting = ref(false)

const form = ref({
  fullName: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirm: '',
  waveId: '',
})

const selectedWave = computed(() =>
  waves.value.find((w) => w.id === form.value.waveId),
)

onMounted(async () => {
  try {
    const response = await admissionApi.getActiveWaves()
    waves.value = response.data.data.waves
    if (waves.value.length === 1) {
      form.value.waveId = waves.value[0]?.id ?? ''
    }
  } catch {
    waves.value = []
  } finally {
    loadingWaves.value = false
  }
})

function validate(): string | null {
  if (form.value.fullName.trim().length < 3) {
    return 'Nama lengkap minimal 3 karakter.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    return 'Format email tidak valid.'
  }
  if (form.value.password.length < 8) {
    return 'Kata sandi minimal 8 karakter.'
  }
  if (form.value.password !== form.value.passwordConfirm) {
    return 'Konfirmasi kata sandi tidak cocok.'
  }
  if (!form.value.waveId) {
    return 'Pilih gelombang pendaftaran.'
  }
  return null
}

async function handleSubmit() {
  const error = validate()
  if (error) {
    toast.error(error)
    return
  }

  isSubmitting.value = true
  try {
    const response = await admissionApi.register({
      fullName: form.value.fullName.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim() || undefined,
      password: form.value.password,
      passwordConfirm: form.value.passwordConfirm,
      waveId: form.value.waveId,
    })
    const registrationNumber = response.data.data.registrationNumber
    toast.success(
      `Pendaftaran berhasil! Nomor pendaftaran Anda: ${registrationNumber}. Silakan masuk.`,
    )
    await router.push({ name: 'login' })
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal membuat akun pendaftaran.'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10"
  >
    <Card class="w-full max-w-lg">
      <CardHeader class="text-center">
        <img
          src="/logo.webp"
          alt="Logo"
          class="mx-auto mb-2 h-14 w-14 object-contain"
        />
        <CardTitle>Daftar Akun PSB</CardTitle>
        <CardDescription>
          Buat akun untuk memulai pendaftaran santri baru.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          class="space-y-4"
          @submit.prevent="handleSubmit"
        >
          <div class="space-y-2">
            <Label for="fullName">Nama Lengkap Calon Santri</Label>
            <Input
              id="fullName"
              v-model="form.fullName"
              placeholder="cth. Ahmad Fauzi"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="nama@email.com"
              required
            />
            <p class="text-xs text-muted-foreground">
              Email digunakan untuk masuk ke portal PSB.
            </p>
          </div>

          <div class="space-y-2">
            <Label for="phone">No. HP (Opsional)</Label>
            <Input
              id="phone"
              v-model="form.phone"
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="password">Kata Sandi</Label>
              <Input
                id="password"
                v-model="form.password"
                type="password"
                required
              />
            </div>
            <div class="space-y-2">
              <Label for="passwordConfirm">Konfirmasi Kata Sandi</Label>
              <Input
                id="passwordConfirm"
                v-model="form.passwordConfirm"
                type="password"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label>Gelombang Pendaftaran</Label>
            <div
              v-if="loadingWaves"
              class="text-sm text-muted-foreground"
            >
              Memuat gelombang…
            </div>
            <div
              v-else-if="waves.length === 0"
              class="rounded-md border border-dashed p-3 text-sm text-muted-foreground"
            >
              Tidak ada gelombang yang dibuka saat ini.
            </div>
            <Select
              v-else
              v-model="form.waveId"
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih gelombang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="wave in waves"
                  :key="wave.id"
                  :value="wave.id"
                >
                  {{ wave.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p
              v-if="selectedWave"
              class="text-xs text-muted-foreground"
            >
              Biaya pendaftaran:
              {{ formatIDR(selectedWave.registrationFee) }} · Sisa kuota:
              {{ selectedWave.remainingQuota }}
            </p>
          </div>

          <Button
            type="submit"
            class="w-full"
            :disabled="isSubmitting || waves.length === 0"
          >
            {{ isSubmitting ? 'Memproses…' : 'Daftar' }}
          </Button>

          <p class="text-center text-sm text-muted-foreground">
            Sudah punya akun?
            <RouterLink
              to="/login"
              class="font-medium text-primary hover:underline"
            >
              Masuk di sini
            </RouterLink>
          </p>
        </form>
      </CardContent>
    </Card>
  </div>
</template>
