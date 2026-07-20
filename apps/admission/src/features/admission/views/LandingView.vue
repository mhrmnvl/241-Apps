<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/card'
import { Badge } from '@/ui/badge'
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  UserPlus,
  Wallet,
} from 'lucide-vue-next'
import { usePublicAdmission } from '../composables/usePublicAdmission'
import type { ActiveWave, AdmissionDocumentType } from '../types'
import { formatDate, formatIDR } from '../utils'

const { fetchActiveWaves } = usePublicAdmission()

const waves = ref<ActiveWave[]>([])
const documentTypes = ref<AdmissionDocumentType[]>([])
const loading = ref(true)

onMounted(async () => {
  const data = await fetchActiveWaves()
  if (data) {
    waves.value = data.waves
    documentTypes.value = data.documentTypes
  }
  loading.value = false
})

const steps = [
  { title: 'Buat Akun', description: 'Daftar dengan email dan data diri.' },
  {
    title: 'Isi Formulir',
    description: 'Lengkapi data diri, orang tua, alamat, dan sekolah asal.',
  },
  {
    title: 'Unggah Berkas & Bayar',
    description: 'Unggah berkas persyaratan dan bukti pembayaran.',
  },
  {
    title: 'Verifikasi Admin',
    description: 'Admin memeriksa berkas; revisi bila perlu.',
  },
  {
    title: 'Pengumuman',
    description: 'Lihat hasil seleksi dan pengumuman di akun Anda.',
  },
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Topbar -->
    <header class="border-b">
      <div
        class="mx-auto flex max-w-5xl items-center justify-between px-4 py-4"
      >
        <div class="flex items-center gap-3">
          <img
            src="/logo.webp"
            alt="Logo"
            class="h-10 w-10 object-contain"
          />
          <div>
            <p class="font-semibold leading-tight">PSB 241</p>
            <p class="text-xs text-muted-foreground">Penerimaan Santri Baru</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <RouterLink to="/login">
            <Button variant="outline">Masuk</Button>
          </RouterLink>
          <RouterLink to="/register">
            <Button>Daftar Sekarang</Button>
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <!-- Hero -->
      <section class="space-y-4 text-center">
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Penerimaan Santri Baru
          <span class="block text-primary">MTs Persis 241 Al-Ikhlash</span>
        </h1>
        <p class="mx-auto max-w-2xl text-muted-foreground">
          Daftar secara online: buat akun, lengkapi formulir, unggah berkas, dan
          pantau status penerimaan langsung dari akun Anda.
        </p>
      </section>

      <!-- Gelombang aktif -->
      <section>
        <h2 class="mb-4 text-xl font-semibold">Gelombang Pendaftaran</h2>
        <div
          v-if="loading"
          class="text-sm text-muted-foreground"
        >
          Memuat informasi gelombang…
        </div>
        <div
          v-else-if="waves.length === 0"
          class="rounded-lg border border-dashed p-8 text-center text-muted-foreground"
        >
          Belum ada gelombang pendaftaran yang dibuka saat ini. Silakan cek
          kembali nanti.
        </div>
        <div
          v-else
          class="grid gap-4 sm:grid-cols-2"
        >
          <Card
            v-for="wave in waves"
            :key="wave.id"
          >
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle>{{ wave.name }}</CardTitle>
                <Badge>{{ wave.code }}</Badge>
              </div>
              <CardDescription>
                Tahun Ajaran {{ wave.academicYear }}
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-2 text-sm">
              <p class="flex items-center gap-2">
                <CalendarDays class="h-4 w-4 text-muted-foreground" />
                {{ formatDate(wave.startDate) }} —
                {{ formatDate(wave.endDate) }}
              </p>
              <p class="flex items-center gap-2">
                <UserPlus class="h-4 w-4 text-muted-foreground" />
                Sisa kuota: {{ wave.remainingQuota }} dari {{ wave.quota }}
              </p>
              <p class="flex items-center gap-2">
                <Wallet class="h-4 w-4 text-muted-foreground" />
                Biaya pendaftaran: {{ formatIDR(wave.registrationFee) }}
              </p>
              <p
                v-if="wave.description"
                class="text-muted-foreground"
              >
                {{ wave.description }}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Alur pendaftaran -->
      <section>
        <h2 class="mb-4 text-xl font-semibold">Alur Pendaftaran</h2>
        <ol class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <li
            v-for="(step, index) in steps"
            :key="step.title"
            class="rounded-lg border p-4"
          >
            <div
              class="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
            >
              {{ index + 1 }}
            </div>
            <p class="font-medium">{{ step.title }}</p>
            <p class="text-sm text-muted-foreground">{{ step.description }}</p>
          </li>
        </ol>
      </section>

      <!-- Syarat berkas -->
      <section v-if="documentTypes.length > 0">
        <h2 class="mb-4 text-xl font-semibold">Syarat Berkas</h2>
        <ul class="grid gap-2 sm:grid-cols-2">
          <li
            v-for="doc in documentTypes"
            :key="doc.id"
            class="flex items-center gap-2 rounded-lg border p-3 text-sm"
          >
            <component
              :is="doc.isRequired ? CheckCircle2 : FileText"
              class="h-4 w-4"
              :class="doc.isRequired ? 'text-primary' : 'text-muted-foreground'"
            />
            {{ doc.name }}
            <Badge
              v-if="!doc.isRequired"
              variant="secondary"
              class="ml-auto"
            >
              Opsional
            </Badge>
          </li>
        </ul>
      </section>

      <!-- CTA -->
      <section class="rounded-lg bg-muted p-8 text-center">
        <h2 class="text-xl font-semibold">Siap mendaftar?</h2>
        <p class="mt-1 text-muted-foreground">
          Buat akun sekarang dan lengkapi formulir pendaftaran Anda.
        </p>
        <RouterLink to="/register">
          <Button
            class="mt-4"
            size="lg"
          >
            Daftar Sekarang
          </Button>
        </RouterLink>
      </section>
    </main>

    <footer class="border-t py-6 text-center text-sm text-muted-foreground">
      © {{ new Date().getFullYear() }} MTs Persis 241 Al-Ikhlash
    </footer>
  </div>
</template>
