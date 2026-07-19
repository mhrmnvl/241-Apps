<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/card'
import { Badge } from '@/ui/badge'
import { Bell, CheckCircle2, Circle, Megaphone } from 'lucide-vue-next'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import StatusBadge from '../components/StatusBadge.vue'
import type {
  AdmissionAnnouncement,
  AdmissionApplication,
  AdmissionNotification,
  AdmissionStatus,
} from '../types'
import { PAYMENT_STATUS_LABELS, STATUS_LABELS } from '../types'
import { formatDateTime, formatIDR } from '../utils'

const application = ref<AdmissionApplication | null>(null)
const notifications = ref<AdmissionNotification[]>([])
const unreadCount = ref(0)
const announcements = ref<AdmissionAnnouncement[]>([])
const loading = ref(true)

const breadcrumbs = [{ title: 'Status Pendaftaran' }]

const TIMELINE: { status: AdmissionStatus; label: string }[] = [
  { status: 'DRAFT', label: 'Mengisi Formulir' },
  { status: 'SUBMITTED', label: 'Menunggu Verifikasi' },
  { status: 'VERIFIED', label: 'Terverifikasi' },
  { status: 'ACCEPTED', label: 'Diterima' },
  { status: 'ENROLLED', label: 'Resmi Jadi Santri' },
]

const timelineIndex = computed(() => {
  const status = application.value?.status
  if (!status) return -1
  if (status === 'REVISION_NEEDED') return 0
  if (status === 'REJECTED') return -2
  return TIMELINE.findIndex((t) => t.status === status)
})

const requiredDocsUploaded = computed(() => {
  const app = application.value
  if (!app) return { done: 0, total: 0 }
  const requiredTypes = (app.documentTypes ?? []).filter((t) => t.isRequired)
  const done = requiredTypes.filter((t) =>
    app.documents.some(
      (d) => d.documentTypeId === t.id && d.status !== 'REJECTED',
    ),
  ).length
  return { done, total: requiredTypes.length }
})

onMounted(async () => {
  try {
    const [appRes, notifRes, annRes] = await Promise.all([
      admissionApi.getMyApplication(),
      admissionApi.getMyNotifications(),
      admissionApi.getAnnouncements(),
    ])
    application.value = appRes.data.data
    notifications.value = notifRes.data.data.data
    unreadCount.value = notifRes.data.data.unreadCount
    announcements.value = annRes.data.data
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat data pendaftaran.'))
  } finally {
    loading.value = false
  }
})

async function markAllRead() {
  try {
    await admissionApi.markAllNotificationsRead()
    notifications.value = notifications.value.map((n) => ({
      ...n,
      readAt: n.readAt ?? new Date().toISOString(),
    }))
    unreadCount.value = 0
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menandai notifikasi.'))
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div
      v-if="loading"
      class="p-6 text-sm text-muted-foreground"
    >
      Memuat data pendaftaran…
    </div>

    <div
      v-else-if="application"
      class="space-y-6 p-4 sm:p-6"
    >
      <!-- Ringkasan -->
      <Card>
        <CardHeader>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>{{ application.fullName }}</CardTitle>
              <CardDescription>
                No. Pendaftaran:
                <span class="font-mono font-medium">
                  {{ application.registrationNumber }}
                </span>
                · {{ application.wave.name }}
              </CardDescription>
            </div>
            <StatusBadge :status="application.status" />
          </div>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Banner revisi / tolak -->
          <div
            v-if="application.status === 'REVISION_NEEDED'"
            class="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm"
          >
            <p class="font-semibold text-destructive">
              Pendaftaran Anda perlu diperbaiki
            </p>
            <p class="mt-1">{{ application.revisionNote }}</p>
            <RouterLink to="/pendaftaran/formulir">
              <Button
                variant="destructive"
                size="sm"
                class="mt-3"
              >
                Perbaiki Sekarang
              </Button>
            </RouterLink>
          </div>
          <div
            v-else-if="application.status === 'REJECTED'"
            class="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm"
          >
            <p class="font-semibold text-destructive">
              Mohon maaf, pendaftaran Anda belum dapat diterima.
            </p>
            <p
              v-if="application.decisionNote"
              class="mt-1"
            >
              Alasan: {{ application.decisionNote }}
            </p>
          </div>
          <div
            v-else-if="
              application.status === 'ACCEPTED' ||
              application.status === 'ENROLLED'
            "
            class="rounded-md border border-primary/50 bg-primary/10 p-4 text-sm"
          >
            <p class="font-semibold text-primary">
              🎉 Selamat! Anda dinyatakan
              {{ STATUS_LABELS[application.status] }}.
            </p>
            <p
              v-if="application.decisionNote"
              class="mt-1"
            >
              {{ application.decisionNote }}
            </p>
          </div>

          <!-- Timeline -->
          <ol class="grid gap-2 sm:grid-cols-5">
            <li
              v-for="(step, index) in TIMELINE"
              :key="step.status"
              class="flex items-center gap-2 rounded-md border p-3 text-sm"
              :class="index <= timelineIndex ? 'border-primary' : ''"
            >
              <component
                :is="index <= timelineIndex ? CheckCircle2 : Circle"
                class="h-4 w-4 shrink-0"
                :class="
                  index <= timelineIndex
                    ? 'text-primary'
                    : 'text-muted-foreground'
                "
              />
              {{ step.label }}
            </li>
          </ol>

          <!-- Ringkasan kelengkapan -->
          <div class="grid gap-3 sm:grid-cols-3">
            <div class="rounded-md border p-3 text-sm">
              <p class="text-muted-foreground">Berkas Wajib</p>
              <p class="font-semibold">
                {{ requiredDocsUploaded.done }} /
                {{ requiredDocsUploaded.total }} terunggah
              </p>
            </div>
            <div class="rounded-md border p-3 text-sm">
              <p class="text-muted-foreground">Pembayaran</p>
              <p class="font-semibold">
                {{
                  application.payment
                    ? PAYMENT_STATUS_LABELS[application.payment.status]
                    : '-'
                }}
                <span
                  v-if="application.payment"
                  class="font-normal text-muted-foreground"
                >
                  · {{ formatIDR(application.payment.amount) }}
                </span>
              </p>
            </div>
            <div class="rounded-md border p-3 text-sm">
              <p class="text-muted-foreground">Terkirim</p>
              <p class="font-semibold">
                {{ formatDateTime(application.submittedAt) }}
              </p>
            </div>
          </div>

          <RouterLink
            v-if="
              application.status === 'DRAFT' ||
              application.status === 'REVISION_NEEDED'
            "
            to="/pendaftaran/formulir"
          >
            <Button class="mt-2">Lanjutkan Pengisian Formulir</Button>
          </RouterLink>
        </CardContent>
      </Card>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Notifikasi -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <CardTitle class="flex items-center gap-2">
                <Bell class="h-4 w-4" />
                Notifikasi
                <Badge
                  v-if="unreadCount > 0"
                  variant="destructive"
                >
                  {{ unreadCount }}
                </Badge>
              </CardTitle>
              <Button
                v-if="unreadCount > 0"
                variant="ghost"
                size="sm"
                @click="markAllRead"
              >
                Tandai semua dibaca
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p
              v-if="notifications.length === 0"
              class="text-sm text-muted-foreground"
            >
              Belum ada notifikasi.
            </p>
            <ul
              v-else
              class="space-y-3"
            >
              <li
                v-for="notification in notifications"
                :key="notification.id"
                class="rounded-md border p-3 text-sm"
                :class="notification.readAt ? 'opacity-70' : 'border-primary'"
              >
                <p class="font-medium">{{ notification.title }}</p>
                <p class="mt-1 whitespace-pre-line text-muted-foreground">
                  {{ notification.message }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ formatDateTime(notification.createdAt) }}
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>

        <!-- Pengumuman -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Megaphone class="h-4 w-4" />
              Pengumuman
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              v-if="announcements.length === 0"
              class="text-sm text-muted-foreground"
            >
              Belum ada pengumuman.
            </p>
            <ul
              v-else
              class="space-y-3"
            >
              <li
                v-for="announcement in announcements"
                :key="announcement.id"
                class="rounded-md border p-3 text-sm"
              >
                <p class="font-medium">{{ announcement.title }}</p>
                <p class="mt-1 whitespace-pre-line text-muted-foreground">
                  {{ announcement.content }}
                </p>
                <p class="mt-1 text-xs text-muted-foreground">
                  {{ formatDateTime(announcement.publishedAt) }}
                  <span v-if="announcement.wave">
                    · {{ announcement.wave.name }}
                  </span>
                </p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  </AppLayout>
</template>
