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
import { useMyApplication } from '../composables/useMyApplication'
import { useApplicationFormState } from '../composables/useApplicationFormState'
import { useApplicationUploads } from '../composables/useApplicationUploads'
import StatusBadge from '../components/StatusBadge.vue'
import PersonalDataStep from '../components/PersonalDataStep.vue'
import ParentsStep from '../components/ParentsStep.vue'
import AddressStep from '../components/AddressStep.vue'
import SchoolStep from '../components/SchoolStep.vue'
import DocumentsStep from '../components/DocumentsStep.vue'
import PaymentStep from '../components/PaymentStep.vue'
import ReviewStep from '../components/ReviewStep.vue'
import type { AdmissionApplication } from '../types'

const router = useRouter()

const {
  fetchMyApplication,
  updateStep,
  uploadDocument: uploadDocumentReq,
  uploadPaymentProof: uploadPaymentProofReq,
  submit: submitReq,
} = useMyApplication()

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

const {
  personal,
  parents,
  address,
  school,
  payment,
  hydrate,
  addParent,
  removeParent,
  buildStepPayload,
} = useApplicationFormState()

async function refresh() {
  const data = await fetchMyApplication()
  if (data) hydrate(data)
}

const {
  documentFiles,
  uploadingDoc,
  onDocumentFileChange,
  uploadDocument,
  paymentFile,
  uploadingPayment,
  onPaymentFileChange,
  uploadPayment,
} = useApplicationUploads({
  payment,
  uploadDocumentReq,
  uploadPaymentProofReq,
  refresh,
})

onMounted(async () => {
  const data = await fetchMyApplication()
  if (data) hydrate(data)
  loading.value = false
})

async function saveStep(): Promise<boolean> {
  if (!editable.value) return true

  const payload = buildStepPayload(currentStep.value)
  if (!payload) return true

  isSaving.value = true
  const result = await updateStep(payload)
  if (result.success && result.data) {
    hydrate(result.data)
  }
  isSaving.value = false
  return result.success
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

async function submitApplication() {
  isSubmitting.value = true
  const result = await submitReq()
  if (result.success) {
    toast.success('Formulir berhasil dikirim! Menunggu verifikasi admin.')
    await router.push('/pendaftaran')
  }
  isSubmitting.value = false
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
          <PersonalDataStep
            v-if="currentStep === 0"
            v-model="personal"
            :editable="editable"
          />

          <ParentsStep
            v-else-if="currentStep === 1"
            v-model="parents"
            :editable="editable"
            :on-add="addParent"
            :on-remove="removeParent"
          />

          <AddressStep
            v-else-if="currentStep === 2"
            v-model="address"
            :editable="editable"
          />

          <SchoolStep
            v-else-if="currentStep === 3"
            v-model="school"
            :editable="editable"
          />

          <DocumentsStep
            v-else-if="currentStep === 4"
            :document-types="application.documentTypes ?? []"
            :documents="application.documents"
            :document-files="documentFiles"
            :uploading-doc="uploadingDoc"
            :editable="editable"
            :on-file-change="onDocumentFileChange"
            :on-upload="uploadDocument"
          />

          <PaymentStep
            v-else-if="currentStep === 5"
            v-model="payment"
            :application-payment="application.payment"
            :editable="editable"
            :payment-file="paymentFile"
            :uploading-payment="uploadingPayment"
            :on-file-change="onPaymentFileChange"
            :on-upload="uploadPayment"
          />

          <ReviewStep
            v-else
            :personal="personal"
            :parents="parents"
            :address="address"
            :application="application"
            :editable="editable"
            :is-submitting="isSubmitting"
            :on-submit="submitApplication"
          />

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
