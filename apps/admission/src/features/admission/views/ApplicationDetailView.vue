<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { ExternalLink } from 'lucide-vue-next'
import { useApplicationDetail } from '../composables/useApplicationDetail'
import StatusBadge from '../components/StatusBadge.vue'
import {
  DOCUMENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  RELATION_LABELS,
} from '../types'
import { fileUrl, formatDate, formatDateTime, formatIDR } from '../utils'

const route = useRoute()
const router = useRouter()
const applicationId = route.params.id as string

const {
  application,
  loading,
  acting,
  fetchDetail,
  approveDocument,
  rejectDocument,
  verifyPaymentApprove,
  rejectPayment,
  requestRevision,
  verifyApplication,
  accept,
  reject,
  enroll,
} = useApplicationDetail()

const breadcrumbs = [
  { title: 'Admin PSB', href: '/admin' },
  { title: 'Pendaftar', href: '/admin/pendaftar' },
  { title: 'Detail' },
]

// Dialog state
type DialogKind =
  | 'revision'
  | 'reject'
  | 'accept'
  | 'enroll'
  | 'reject-doc'
  | 'reject-payment'
  | null
const dialogKind = ref<DialogKind>(null)
const dialogNote = ref('')
const dialogDocId = ref<string | null>(null)
const enrollForm = ref({ nis: '', nisn: '' })

const status = computed(() => application.value?.status)

const documentRows = computed(() =>
  (application.value?.documentTypes ?? []).map((docType) => ({
    docType,
    doc:
      application.value?.documents.find(
        (d) => d.documentTypeId === docType.id,
      ) ?? null,
  })),
)

onMounted(() => {
  void fetchDetail(applicationId)
})

function openDialog(kind: DialogKind, docId?: string) {
  dialogKind.value = kind
  dialogNote.value = ''
  dialogDocId.value = docId ?? null
}

async function handleApproveDocument(docId: string) {
  await approveDocument(applicationId, docId)
}

async function handleVerifyPayment() {
  await verifyPaymentApprove(applicationId)
}

async function handleVerifyApplication() {
  await verifyApplication(applicationId)
}

async function confirmDialog() {
  if (dialogKind.value === 'revision') {
    if (!dialogNote.value.trim()) {
      toast.error('Catatan revisi wajib diisi.')
      return
    }
    const r = await requestRevision(applicationId, dialogNote.value)
    if (r.success) dialogKind.value = null
  } else if (dialogKind.value === 'reject') {
    if (!dialogNote.value.trim()) {
      toast.error('Alasan penolakan wajib diisi.')
      return
    }
    const r = await reject(applicationId, dialogNote.value)
    if (r.success) dialogKind.value = null
  } else if (dialogKind.value === 'accept') {
    const r = await accept(applicationId, dialogNote.value || undefined)
    if (r.success) dialogKind.value = null
  } else if (dialogKind.value === 'enroll') {
    if (!enrollForm.value.nis.trim() || !enrollForm.value.nisn.trim()) {
      toast.error('NIS dan NISN wajib diisi.')
      return
    }
    const r = await enroll(applicationId, {
      nis: enrollForm.value.nis.trim(),
      nisn: enrollForm.value.nisn.trim(),
    })
    if (r.success) dialogKind.value = null
  } else if (dialogKind.value === 'reject-doc' && dialogDocId.value) {
    if (!dialogNote.value.trim()) {
      toast.error('Alasan penolakan berkas wajib diisi.')
      return
    }
    const r = await rejectDocument(
      applicationId,
      dialogDocId.value,
      dialogNote.value,
    )
    if (r.success) dialogKind.value = null
  } else if (dialogKind.value === 'reject-payment') {
    if (!dialogNote.value.trim()) {
      toast.error('Alasan penolakan pembayaran wajib diisi.')
      return
    }
    const r = await rejectPayment(applicationId, dialogNote.value)
    if (r.success) dialogKind.value = null
  }
}

const dialogTitles: Record<Exclude<DialogKind, null>, string> = {
  revision: 'Minta Revisi',
  reject: 'Tolak Pendaftaran',
  accept: 'Terima Pendaftar',
  enroll: 'Proses Jadi Santri',
  'reject-doc': 'Tolak Berkas',
  'reject-payment': 'Tolak Bukti Pembayaran',
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div
      v-if="loading"
      class="p-6 text-sm text-muted-foreground"
    >
      Memuat detail pendaftar…
    </div>

    <div
      v-else-if="application"
      class="space-y-6 p-4 sm:p-6"
    >
      <!-- Header + aksi -->
      <Card>
        <CardHeader>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{{ application.fullName }}</CardTitle>
              <CardDescription>
                <span class="font-mono">
                  {{ application.registrationNumber }}
                </span>
                · {{ application.wave.name }} · Dikirim
                {{ formatDateTime(application.submittedAt) }}
              </CardDescription>
              <p
                v-if="(application.duplicateNikCount ?? 0) > 0"
                class="mt-1 text-sm font-medium text-destructive"
              >
                ⚠ NIK sama dengan {{ application.duplicateNikCount }} pendaftar
                lain.
              </p>
            </div>
            <StatusBadge :status="application.status" />
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            <Button
              v-if="status === 'SUBMITTED'"
              variant="outline"
              @click="openDialog('revision')"
            >
              Minta Revisi
            </Button>
            <Button
              v-if="status === 'SUBMITTED'"
              @click="handleVerifyApplication"
            >
              Verifikasi Aplikasi
            </Button>
            <Button
              v-if="status === 'VERIFIED'"
              @click="openDialog('accept')"
            >
              Terima
            </Button>
            <Button
              v-if="status === 'SUBMITTED' || status === 'VERIFIED'"
              variant="destructive"
              @click="openDialog('reject')"
            >
              Tolak
            </Button>
            <Button
              v-if="status === 'ACCEPTED'"
              @click="openDialog('enroll')"
            >
              Proses Jadi Santri
            </Button>
          </div>
          <p
            v-if="application.revisionNote && status === 'REVISION_NEEDED'"
            class="mt-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm"
          >
            Catatan revisi: {{ application.revisionNote }}
          </p>
          <p
            v-if="application.decisionNote"
            class="mt-3 rounded-md border p-3 text-sm"
          >
            Catatan keputusan: {{ application.decisionNote }}
          </p>
        </CardContent>
      </Card>

      <div class="grid gap-6 lg:grid-cols-2">
        <!-- Data diri -->
        <Card>
          <CardHeader>
            <CardTitle>Data Diri</CardTitle>
          </CardHeader>
          <CardContent class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p class="text-muted-foreground">Jenis Kelamin</p>
            <p>
              {{
                application.gender === 'MALE'
                  ? 'Laki-laki'
                  : application.gender === 'FEMALE'
                    ? 'Perempuan'
                    : '-'
              }}
            </p>
            <p class="text-muted-foreground">Tempat, Tgl Lahir</p>
            <p>
              {{ application.birthPlace ?? '-' }},
              {{ formatDate(application.birthDate) }}
            </p>
            <p class="text-muted-foreground">NIK</p>
            <p>{{ application.nik ?? '-' }}</p>
            <p class="text-muted-foreground">NISN</p>
            <p>{{ application.nisn ?? '-' }}</p>
            <p class="text-muted-foreground">Email</p>
            <p>{{ application.email ?? '-' }}</p>
            <p class="text-muted-foreground">No. HP</p>
            <p>{{ application.phone ?? '-' }}</p>
            <p class="text-muted-foreground">Alamat</p>
            <p>
              {{
                [
                  application.street,
                  application.village,
                  application.district,
                  application.city,
                  application.province,
                ]
                  .filter(Boolean)
                  .join(', ') || '-'
              }}
            </p>
            <p class="text-muted-foreground">Sekolah Asal</p>
            <p>{{ application.previousSchoolName ?? '-' }}</p>
          </CardContent>
        </Card>

        <!-- Orang tua -->
        <Card>
          <CardHeader>
            <CardTitle>Orang Tua / Wali</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm">
            <p
              v-if="application.parents.length === 0"
              class="text-muted-foreground"
            >
              Belum diisi.
            </p>
            <div
              v-for="parent in application.parents"
              :key="parent.relation"
              class="rounded-md border p-3"
            >
              <p class="font-medium">
                {{ RELATION_LABELS[parent.relation] }}: {{ parent.name }}
                <Badge
                  v-if="parent.isPrimary"
                  variant="secondary"
                  class="ml-1"
                >
                  Kontak Utama
                </Badge>
              </p>
              <p class="text-muted-foreground">
                NIK: {{ parent.nik ?? '-' }} · HP: {{ parent.phone ?? '-' }}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Berkas -->
      <Card>
        <CardHeader>
          <CardTitle>Berkas</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div
            v-for="row in documentRows"
            :key="row.docType.id"
            class="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-sm"
          >
            <div>
              <p class="font-medium">
                {{ row.docType.name }}
                <Badge
                  v-if="!row.docType.isRequired"
                  variant="secondary"
                  class="ml-1"
                >
                  Opsional
                </Badge>
              </p>
              <p
                v-if="row.doc"
                class="text-muted-foreground"
              >
                {{ row.doc.file.originalName }} ·
                {{ DOCUMENT_STATUS_LABELS[row.doc.status] }}
                <span
                  v-if="row.doc.note"
                  class="text-destructive"
                >
                  — {{ row.doc.note }}
                </span>
              </p>
              <p
                v-else
                class="text-muted-foreground"
              >
                Belum diunggah
              </p>
            </div>
            <div class="flex items-center gap-2">
              <a
                v-if="row.doc"
                :href="fileUrl(row.doc.file.storageKey)"
                target="_blank"
                rel="noopener"
              >
                <Button
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink class="mr-1 h-3 w-3" />
                  Lihat
                </Button>
              </a>
              <template v-if="row.doc && row.doc.status !== 'APPROVED'">
                <Button
                  size="sm"
                  :disabled="acting"
                  @click="handleApproveDocument(row.doc.id)"
                >
                  Setujui
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  :disabled="acting"
                  @click="openDialog('reject-doc', row.doc.id)"
                >
                  Tolak
                </Button>
              </template>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Pembayaran -->
      <Card>
        <CardHeader>
          <CardTitle>Pembayaran</CardTitle>
        </CardHeader>
        <CardContent class="text-sm">
          <div
            v-if="application.payment"
            class="flex flex-wrap items-center justify-between gap-3"
          >
            <div>
              <p>
                {{ formatIDR(application.payment.amount) }} ·
                <span class="font-medium">
                  {{ PAYMENT_STATUS_LABELS[application.payment.status] }}
                </span>
              </p>
              <p class="text-muted-foreground">
                Bank: {{ application.payment.bankName ?? '-' }} · Pengirim:
                {{ application.payment.senderAccountName ?? '-' }} · Tgl:
                {{ formatDate(application.payment.transferDate) }}
              </p>
              <p
                v-if="application.payment.note"
                class="text-destructive"
              >
                Catatan: {{ application.payment.note }}
              </p>
            </div>
            <div class="flex items-center gap-2">
              <a
                v-if="application.payment.proofFile"
                :href="fileUrl(application.payment.proofFile.storageKey)"
                target="_blank"
                rel="noopener"
              >
                <Button
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink class="mr-1 h-3 w-3" />
                  Lihat Bukti
                </Button>
              </a>
              <template
                v-if="
                  application.payment.status === 'PENDING' ||
                  application.payment.status === 'REJECTED'
                "
              >
                <Button
                  size="sm"
                  :disabled="
                    acting || application.payment.status === 'REJECTED'
                  "
                  @click="handleVerifyPayment"
                >
                  Verifikasi
                </Button>
                <Button
                  v-if="application.payment.status === 'PENDING'"
                  variant="destructive"
                  size="sm"
                  :disabled="acting"
                  @click="openDialog('reject-payment')"
                >
                  Tolak
                </Button>
              </template>
            </div>
          </div>
          <p
            v-else
            class="text-muted-foreground"
          >
            Data pembayaran tidak tersedia.
          </p>
        </CardContent>
      </Card>

      <!-- Dialog aksi -->
      <Dialog
        :open="dialogKind !== null"
        @update:open="(open) => !open && (dialogKind = null)"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {{ dialogKind ? dialogTitles[dialogKind] : '' }}
            </DialogTitle>
            <DialogDescription v-if="dialogKind === 'enroll'">
              Masukkan NIS/NISN untuk memproses pendaftar menjadi santri. Akun
              pendaftar akan otomatis menjadi akun santri.
            </DialogDescription>
          </DialogHeader>

          <div
            v-if="dialogKind === 'enroll'"
            class="space-y-4"
          >
            <div class="space-y-2">
              <Label>NIS</Label>
              <Input v-model="enrollForm.nis" />
            </div>
            <div class="space-y-2">
              <Label>NISN</Label>
              <Input v-model="enrollForm.nisn" />
            </div>
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <Label>
              {{
                dialogKind === 'accept'
                  ? 'Catatan (opsional)'
                  : 'Catatan / Alasan'
              }}
            </Label>
            <Textarea
              v-model="dialogNote"
              rows="4"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              @click="dialogKind = null"
            >
              Batal
            </Button>
            <Button
              :disabled="acting"
              @click="confirmDialog"
            >
              {{ acting ? 'Memproses…' : 'Konfirmasi' }}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <div
      v-else
      class="p-6"
    >
      <p class="text-sm text-muted-foreground">Pendaftar tidak ditemukan.</p>
      <Button
        variant="outline"
        class="mt-3"
        @click="router.push('/admin/pendaftar')"
      >
        Kembali
      </Button>
    </div>
  </AppLayout>
</template>
