<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
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
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Badge } from '@/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { admissionApi } from '../api/admissionApi'
import StatusBadge from '../components/StatusBadge.vue'
import type { AdmissionApplication, ParentRelation } from '../types'
import {
  DOCUMENT_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  RELATION_LABELS,
} from '../types'
import { formatIDR } from '../utils'

const router = useRouter()

const application = ref<AdmissionApplication | null>(null)
const loading = ref(true)
const isSaving = ref(false)
const isSubmitting = ref(false)
const currentStep = ref(0)

const breadcrumbs = [
  { title: 'Pendaftaran', href: '/pendaftaran' },
  { title: 'Formulir' },
]

const steps = [
  'Data Diri',
  'Orang Tua/Wali',
  'Alamat',
  'Sekolah Asal',
  'Berkas',
  'Pembayaran',
  'Review & Kirim',
]

const editable = computed(() => {
  const status = application.value?.status
  return status === 'DRAFT' || status === 'REVISION_NEEDED'
})

// ── Form state per step ──
const personal = ref({
  fullName: '',
  nickname: '',
  gender: '' as '' | 'MALE' | 'FEMALE',
  birthPlace: '',
  birthDate: '',
  nik: '',
  nisn: '',
  phone: '',
})

interface ParentForm {
  relation: ParentRelation
  name: string
  nik: string
  birthPlace: string
  birthDate: string
  phone: string
  isPrimary: boolean
}

const parents = ref<ParentForm[]>([])

const address = ref({
  street: '',
  rt: '',
  rw: '',
  village: '',
  district: '',
  city: '',
  province: '',
  postalCode: '',
})

const school = ref({
  previousSchoolName: '',
  previousSchoolNpsn: '',
  previousSchoolAddress: '',
  graduationYear: '',
})

// ── Berkas & pembayaran ──
const documentFiles = ref<Record<string, File | null>>({})
const uploadingDoc = ref<string | null>(null)

const payment = ref({
  bankName: '',
  senderAccountName: '',
  transferDate: '',
})
const paymentFile = ref<File | null>(null)
const uploadingPayment = ref(false)

function hydrate(app: AdmissionApplication) {
  application.value = app
  personal.value = {
    fullName: app.fullName ?? '',
    nickname: app.nickname ?? '',
    gender: app.gender ?? '',
    birthPlace: app.birthPlace ?? '',
    birthDate: app.birthDate ? app.birthDate.slice(0, 10) : '',
    nik: app.nik ?? '',
    nisn: app.nisn ?? '',
    phone: app.phone ?? '',
  }
  parents.value = app.parents.map((p) => ({
    relation: p.relation,
    name: p.name,
    nik: p.nik ?? '',
    birthPlace: p.birthPlace ?? '',
    birthDate: p.birthDate ? p.birthDate.slice(0, 10) : '',
    phone: p.phone ?? '',
    isPrimary: p.isPrimary,
  }))
  if (parents.value.length === 0) {
    parents.value = [
      {
        relation: 'FATHER',
        name: '',
        nik: '',
        birthPlace: '',
        birthDate: '',
        phone: '',
        isPrimary: true,
      },
    ]
  }
  address.value = {
    street: app.street ?? '',
    rt: app.rt ?? '',
    rw: app.rw ?? '',
    village: app.village ?? '',
    district: app.district ?? '',
    city: app.city ?? '',
    province: app.province ?? '',
    postalCode: app.postalCode ?? '',
  }
  school.value = {
    previousSchoolName: app.previousSchoolName ?? '',
    previousSchoolNpsn: app.previousSchoolNpsn ?? '',
    previousSchoolAddress: app.previousSchoolAddress ?? '',
    graduationYear: app.graduationYear ? String(app.graduationYear) : '',
  }
  if (app.payment) {
    payment.value = {
      bankName: app.payment.bankName ?? '',
      senderAccountName: app.payment.senderAccountName ?? '',
      transferDate: app.payment.transferDate
        ? app.payment.transferDate.slice(0, 10)
        : '',
    }
  }
}

onMounted(async () => {
  try {
    const response = await admissionApi.getMyApplication()
    hydrate(response.data.data)
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal memuat formulir.'))
  } finally {
    loading.value = false
  }
})

function documentFor(typeId: string) {
  return application.value?.documents.find((d) => d.documentTypeId === typeId)
}

// ── Simpan per langkah (PATCH) ──
async function saveStep(): Promise<boolean> {
  if (!editable.value) return true

  let payload: Record<string, unknown> | null = null
  if (currentStep.value === 0) {
    payload = {
      fullName: personal.value.fullName || undefined,
      nickname: personal.value.nickname || undefined,
      gender: personal.value.gender || undefined,
      birthPlace: personal.value.birthPlace || undefined,
      birthDate: personal.value.birthDate || undefined,
      nik: personal.value.nik || undefined,
      nisn: personal.value.nisn || undefined,
      phone: personal.value.phone || undefined,
    }
  } else if (currentStep.value === 1) {
    const validParents = parents.value.filter((p) => p.name.trim())
    payload = {
      parents: validParents.map((p) => ({
        relation: p.relation,
        name: p.name.trim(),
        nik: p.nik || undefined,
        birthPlace: p.birthPlace || undefined,
        birthDate: p.birthDate || undefined,
        phone: p.phone || undefined,
        isPrimary: p.isPrimary,
      })),
    }
  } else if (currentStep.value === 2) {
    payload = {
      street: address.value.street || undefined,
      rt: address.value.rt || undefined,
      rw: address.value.rw || undefined,
      village: address.value.village || undefined,
      district: address.value.district || undefined,
      city: address.value.city || undefined,
      province: address.value.province || undefined,
      postalCode: address.value.postalCode || undefined,
    }
  } else if (currentStep.value === 3) {
    payload = {
      previousSchoolName: school.value.previousSchoolName || undefined,
      previousSchoolNpsn: school.value.previousSchoolNpsn || undefined,
      previousSchoolAddress: school.value.previousSchoolAddress || undefined,
      graduationYear: school.value.graduationYear
        ? Number(school.value.graduationYear)
        : undefined,
    }
  }

  if (!payload) return true

  isSaving.value = true
  try {
    const response = await admissionApi.updateMyApplication(payload)
    hydrate(response.data.data)
    return true
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal menyimpan formulir.'))
    return false
  } finally {
    isSaving.value = false
  }
}

async function nextStep() {
  const saved = await saveStep()
  if (saved && currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 0) currentStep.value--
}

function addParent() {
  parents.value.push({
    relation: parents.value.some((p) => p.relation === 'FATHER')
      ? 'MOTHER'
      : 'FATHER',
    name: '',
    nik: '',
    birthPlace: '',
    birthDate: '',
    phone: '',
    isPrimary: parents.value.length === 0,
  })
}

function removeParent(index: number) {
  parents.value.splice(index, 1)
}

function onDocumentFileChange(typeCode: string, event: Event) {
  const input = event.target as HTMLInputElement
  documentFiles.value[typeCode] = input.files?.[0] ?? null
}

async function uploadDocument(typeCode: string) {
  const file = documentFiles.value[typeCode]
  if (!file) {
    toast.error('Pilih berkas terlebih dahulu.')
    return
  }
  uploadingDoc.value = typeCode
  try {
    await admissionApi.uploadDocument(typeCode, file)
    const response = await admissionApi.getMyApplication()
    hydrate(response.data.data)
    documentFiles.value[typeCode] = null
    toast.success('Berkas berhasil diunggah.')
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal mengunggah berkas.'))
  } finally {
    uploadingDoc.value = null
  }
}

function onPaymentFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  paymentFile.value = input.files?.[0] ?? null
}

async function uploadPayment() {
  if (!payment.value.bankName || !payment.value.senderAccountName) {
    toast.error('Isi nama bank dan nama pengirim.')
    return
  }
  if (!paymentFile.value) {
    toast.error('Pilih berkas bukti transfer.')
    return
  }
  uploadingPayment.value = true
  try {
    await admissionApi.uploadPaymentProof(
      {
        bankName: payment.value.bankName,
        senderAccountName: payment.value.senderAccountName,
        transferDate: payment.value.transferDate || undefined,
      },
      paymentFile.value,
    )
    const response = await admissionApi.getMyApplication()
    hydrate(response.data.data)
    paymentFile.value = null
    toast.success('Bukti pembayaran berhasil diunggah.')
  } catch (e) {
    toast.error(
      getIndonesianErrorMessage(e, 'Gagal mengunggah bukti pembayaran.'),
    )
  } finally {
    uploadingPayment.value = false
  }
}

async function submitApplication() {
  isSubmitting.value = true
  try {
    await admissionApi.submitMyApplication()
    toast.success('Formulir berhasil dikirim! Menunggu verifikasi admin.')
    await router.push('/pendaftaran')
  } catch (e) {
    toast.error(getIndonesianErrorMessage(e, 'Gagal mengirim formulir.'))
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div
      v-if="loading"
      class="p-6 text-sm text-muted-foreground"
    >
      Memuat formulir…
    </div>

    <div
      v-else-if="application"
      class="space-y-4 p-4 sm:p-6"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 class="text-xl font-semibold">Formulir Pendaftaran</h1>
          <p class="text-sm text-muted-foreground">
            {{ application.registrationNumber }} · {{ application.wave.name }}
          </p>
        </div>
        <StatusBadge :status="application.status" />
      </div>

      <div
        v-if="application.status === 'REVISION_NEEDED'"
        class="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm"
      >
        <span class="font-medium text-destructive">Catatan revisi admin:</span>
        {{ application.revisionNote }}
      </div>
      <div
        v-else-if="!editable"
        class="rounded-md border p-3 text-sm text-muted-foreground"
      >
        Formulir terkunci karena sudah dikirim. Anda tetap dapat melihat
        isiannya.
      </div>

      <!-- Step indicator -->
      <ol class="flex flex-wrap gap-2">
        <li
          v-for="(step, index) in steps"
          :key="step"
        >
          <button
            type="button"
            class="rounded-full border px-3 py-1 text-xs"
            :class="
              index === currentStep
                ? 'border-primary bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:border-primary'
            "
            @click="currentStep = index"
          >
            {{ index + 1 }}. {{ step }}
          </button>
        </li>
      </ol>

      <Card>
        <CardHeader>
          <CardTitle>{{ steps[currentStep] }}</CardTitle>
          <CardDescription v-if="editable">
            Isian tersimpan otomatis setiap berpindah langkah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <!-- Step 1: Data Diri -->
          <div
            v-if="currentStep === 0"
            class="grid gap-4 sm:grid-cols-2"
          >
            <div class="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input
                v-model="personal.fullName"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>Nama Panggilan</Label>
              <Input
                v-model="personal.nickname"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>Jenis Kelamin</Label>
              <Select
                v-model="personal.gender"
                :disabled="!editable"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Laki-laki</SelectItem>
                  <SelectItem value="FEMALE">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Tempat Lahir</Label>
              <Input
                v-model="personal.birthPlace"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>Tanggal Lahir</Label>
              <Input
                v-model="personal.birthDate"
                type="date"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>NIK (16 digit)</Label>
              <Input
                v-model="personal.nik"
                maxlength="16"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>NISN (opsional)</Label>
              <Input
                v-model="personal.nisn"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>No. HP</Label>
              <Input
                v-model="personal.phone"
                :disabled="!editable"
              />
            </div>
          </div>

          <!-- Step 2: Orang Tua -->
          <div
            v-else-if="currentStep === 1"
            class="space-y-4"
          >
            <div
              v-for="(parent, index) in parents"
              :key="index"
              class="rounded-md border p-4"
            >
              <div class="mb-3 flex items-center justify-between">
                <p class="font-medium">
                  {{ RELATION_LABELS[parent.relation] }}
                  <Badge
                    v-if="parent.isPrimary"
                    variant="secondary"
                    class="ml-2"
                  >
                    Kontak Utama
                  </Badge>
                </p>
                <Button
                  v-if="editable && parents.length > 1"
                  variant="ghost"
                  size="sm"
                  @click="removeParent(index)"
                >
                  Hapus
                </Button>
              </div>
              <div class="grid gap-4 sm:grid-cols-2">
                <div class="space-y-2">
                  <Label>Hubungan</Label>
                  <Select
                    v-model="parent.relation"
                    :disabled="!editable"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FATHER">Ayah</SelectItem>
                      <SelectItem value="MOTHER">Ibu</SelectItem>
                      <SelectItem value="GUARDIAN">Wali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label>Nama Lengkap</Label>
                  <Input
                    v-model="parent.name"
                    :disabled="!editable"
                  />
                </div>
                <div class="space-y-2">
                  <Label>NIK</Label>
                  <Input
                    v-model="parent.nik"
                    maxlength="16"
                    :disabled="!editable"
                  />
                </div>
                <div class="space-y-2">
                  <Label>No. HP</Label>
                  <Input
                    v-model="parent.phone"
                    :disabled="!editable"
                  />
                </div>
                <div class="space-y-2">
                  <Label>Tempat Lahir</Label>
                  <Input
                    v-model="parent.birthPlace"
                    :disabled="!editable"
                  />
                </div>
                <div class="space-y-2">
                  <Label>Tanggal Lahir</Label>
                  <Input
                    v-model="parent.birthDate"
                    type="date"
                    :disabled="!editable"
                  />
                </div>
              </div>
            </div>
            <Button
              v-if="editable"
              variant="outline"
              @click="addParent"
            >
              + Tambah Orang Tua/Wali
            </Button>
          </div>

          <!-- Step 3: Alamat -->
          <div
            v-else-if="currentStep === 2"
            class="grid gap-4 sm:grid-cols-2"
          >
            <div class="space-y-2 sm:col-span-2">
              <Label>Alamat (Jalan)</Label>
              <Input
                v-model="address.street"
                :disabled="!editable"
              />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label>RT</Label>
                <Input
                  v-model="address.rt"
                  maxlength="5"
                  :disabled="!editable"
                />
              </div>
              <div class="space-y-2">
                <Label>RW</Label>
                <Input
                  v-model="address.rw"
                  maxlength="5"
                  :disabled="!editable"
                />
              </div>
            </div>
            <div class="space-y-2">
              <Label>Desa/Kelurahan</Label>
              <Input
                v-model="address.village"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>Kecamatan</Label>
              <Input
                v-model="address.district"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>Kota/Kabupaten</Label>
              <Input
                v-model="address.city"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>Provinsi</Label>
              <Input
                v-model="address.province"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>Kode Pos</Label>
              <Input
                v-model="address.postalCode"
                maxlength="10"
                :disabled="!editable"
              />
            </div>
          </div>

          <!-- Step 4: Sekolah Asal -->
          <div
            v-else-if="currentStep === 3"
            class="grid gap-4 sm:grid-cols-2"
          >
            <div class="space-y-2">
              <Label>Nama Sekolah Asal</Label>
              <Input
                v-model="school.previousSchoolName"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>NPSN (opsional)</Label>
              <Input
                v-model="school.previousSchoolNpsn"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2 sm:col-span-2">
              <Label>Alamat Sekolah</Label>
              <Input
                v-model="school.previousSchoolAddress"
                :disabled="!editable"
              />
            </div>
            <div class="space-y-2">
              <Label>Tahun Lulus</Label>
              <Input
                v-model="school.graduationYear"
                type="number"
                :disabled="!editable"
              />
            </div>
          </div>

          <!-- Step 5: Berkas -->
          <div
            v-else-if="currentStep === 4"
            class="space-y-3"
          >
            <div
              v-for="docType in application.documentTypes ?? []"
              :key="docType.id"
              class="rounded-md border p-4"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p class="font-medium">
                    {{ docType.name }}
                    <Badge
                      v-if="!docType.isRequired"
                      variant="secondary"
                      class="ml-1"
                    >
                      Opsional
                    </Badge>
                  </p>
                  <p
                    v-if="documentFor(docType.id)"
                    class="text-sm text-muted-foreground"
                  >
                    {{ documentFor(docType.id)?.file.originalName }} ·
                    {{
                      DOCUMENT_STATUS_LABELS[
                        documentFor(docType.id)?.status ?? 'PENDING'
                      ]
                    }}
                    <span
                      v-if="documentFor(docType.id)?.note"
                      class="text-destructive"
                    >
                      — {{ documentFor(docType.id)?.note }}
                    </span>
                  </p>
                  <p
                    v-else
                    class="text-sm text-muted-foreground"
                  >
                    Belum diunggah (JPG/PNG/PDF, maks. 5 MB)
                  </p>
                </div>
                <div
                  v-if="editable"
                  class="flex items-center gap-2"
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    class="max-w-52 text-sm"
                    @change="onDocumentFileChange(docType.code, $event)"
                  />
                  <Button
                    size="sm"
                    :disabled="
                      uploadingDoc === docType.code ||
                      !documentFiles[docType.code]
                    "
                    @click="uploadDocument(docType.code)"
                  >
                    {{
                      uploadingDoc === docType.code ? 'Mengunggah…' : 'Unggah'
                    }}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 6: Pembayaran -->
          <div
            v-else-if="currentStep === 5"
            class="space-y-4"
          >
            <div class="rounded-md border p-4 text-sm">
              <p>
                Biaya pendaftaran:
                <span class="font-semibold">
                  {{
                    application.payment
                      ? formatIDR(application.payment.amount)
                      : '-'
                  }}
                </span>
              </p>
              <p class="mt-1 text-muted-foreground">
                Status:
                {{
                  application.payment
                    ? PAYMENT_STATUS_LABELS[application.payment.status]
                    : '-'
                }}
                <span
                  v-if="application.payment?.note"
                  class="text-destructive"
                >
                  — {{ application.payment.note }}
                </span>
              </p>
            </div>

            <div
              v-if="editable && application.payment?.status !== 'VERIFIED'"
              class="grid gap-4 sm:grid-cols-2"
            >
              <div class="space-y-2">
                <Label>Nama Bank</Label>
                <Input
                  v-model="payment.bankName"
                  placeholder="cth. BSI"
                />
              </div>
              <div class="space-y-2">
                <Label>Nama Pengirim</Label>
                <Input v-model="payment.senderAccountName" />
              </div>
              <div class="space-y-2">
                <Label>Tanggal Transfer</Label>
                <Input
                  v-model="payment.transferDate"
                  type="date"
                />
              </div>
              <div class="space-y-2">
                <Label>Bukti Transfer (JPG/PNG/PDF)</Label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  class="text-sm"
                  @change="onPaymentFileChange"
                />
              </div>
              <div class="sm:col-span-2">
                <Button
                  :disabled="uploadingPayment"
                  @click="uploadPayment"
                >
                  {{
                    uploadingPayment ? 'Mengunggah…' : 'Unggah Bukti Pembayaran'
                  }}
                </Button>
              </div>
            </div>
          </div>

          <!-- Step 7: Review -->
          <div
            v-else
            class="space-y-4 text-sm"
          >
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="rounded-md border p-4">
                <p class="mb-2 font-medium">Data Diri</p>
                <p>Nama: {{ personal.fullName || '-' }}</p>
                <p>
                  Jenis Kelamin:
                  {{
                    personal.gender === 'MALE'
                      ? 'Laki-laki'
                      : personal.gender === 'FEMALE'
                        ? 'Perempuan'
                        : '-'
                  }}
                </p>
                <p>
                  TTL: {{ personal.birthPlace || '-' }},
                  {{ personal.birthDate || '-' }}
                </p>
                <p>NIK: {{ personal.nik || '-' }}</p>
              </div>
              <div class="rounded-md border p-4">
                <p class="mb-2 font-medium">Orang Tua/Wali</p>
                <p
                  v-for="(parent, index) in parents.filter((p) => p.name)"
                  :key="index"
                >
                  {{ RELATION_LABELS[parent.relation] }}: {{ parent.name }}
                </p>
                <p v-if="!parents.some((p) => p.name)">-</p>
              </div>
              <div class="rounded-md border p-4">
                <p class="mb-2 font-medium">Alamat</p>
                <p>
                  {{
                    [
                      address.street,
                      address.village,
                      address.district,
                      address.city,
                      address.province,
                    ]
                      .filter(Boolean)
                      .join(', ') || '-'
                  }}
                </p>
              </div>
              <div class="rounded-md border p-4">
                <p class="mb-2 font-medium">Berkas & Pembayaran</p>
                <p>
                  Berkas terunggah: {{ application.documents.length }} /
                  {{ (application.documentTypes ?? []).length }}
                </p>
                <p>
                  Pembayaran:
                  {{
                    application.payment
                      ? PAYMENT_STATUS_LABELS[application.payment.status]
                      : '-'
                  }}
                </p>
              </div>
            </div>

            <div
              v-if="editable"
              class="rounded-md border border-primary/50 bg-primary/5 p-4"
            >
              <p class="font-medium">
                Pastikan seluruh data sudah benar sebelum mengirim.
              </p>
              <p class="text-muted-foreground">
                Setelah dikirim, formulir tidak dapat diubah kecuali admin
                meminta revisi.
              </p>
              <Button
                class="mt-3"
                :disabled="isSubmitting"
                @click="submitApplication"
              >
                {{ isSubmitting ? 'Mengirim…' : 'Kirim Formulir' }}
              </Button>
            </div>
          </div>

          <!-- Navigasi -->
          <div class="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              :disabled="currentStep === 0"
              @click="previousStep"
            >
              Sebelumnya
            </Button>
            <Button
              v-if="currentStep < steps.length - 1"
              :disabled="isSaving"
              @click="nextStep"
            >
              {{ isSaving ? 'Menyimpan…' : 'Simpan & Lanjut' }}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
