<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Badge } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import { Checkbox } from '@/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Shield, ArrowRight, Plus, Trash2 } from 'lucide-vue-next'
import { useRoleGuard } from '@/features/platform/auth'
import type { ApprovalWorkflow } from '../types'
import { approvalService } from '../services/approvalService'

// State
const workflows = ref<ApprovalWorkflow[]>([])
const loading = ref(false)
const isFormOpen = ref(false)
const isSubmitting = ref(false)

const { can } = useRoleGuard()

/**
 * The only target this app approves. It is a field on the backend model
 * because the workflow engine is general, but exposing it as a free-text box
 * would let the administrator define a workflow for an entity that never
 * consults one — a screen full of steps that silently governs nothing.
 */
const TARGET_ENTITY = 'InventoryLoan'

interface StepDraft {
  approverRoleCode: string
  isMandatory: boolean
}

const form = ref<{ name: string; description: string; steps: StepDraft[] }>({
  name: '',
  description: '',
  steps: [],
})

function openForm() {
  form.value = {
    name: 'Persetujuan Peminjaman Aset',
    description: '',
    // The arrangement the school runs: the inventory administrator always
    // signs, and the head teacher signs when the administrator asks. Both are
    // editable — this is a starting point, not a rule.
    steps: [
      { approverRoleCode: 'ADMIN', isMandatory: true },
      { approverRoleCode: 'PRINCIPAL', isMandatory: false },
    ],
  }
  isFormOpen.value = true
}

function addStep() {
  form.value.steps.push({ approverRoleCode: '', isMandatory: false })
}

function removeStep(index: number) {
  form.value.steps.splice(index, 1)
}

const activeWorkflow = computed(() =>
  workflows.value.find(
    (wf) => wf.isActive && wf.targetEntity === TARGET_ENTITY,
  ),
)

const formError = computed(() => {
  if (form.value.name.trim() === '') return 'Nama alur wajib diisi.'
  if (form.value.steps.length === 0)
    return 'Alur membutuhkan minimal satu tahap.'
  if (form.value.steps.some((step) => step.approverRoleCode.trim() === ''))
    return 'Setiap tahap harus menyebutkan kode role penyetuju.'
  // The first approver is reached the moment a loan is created, so there is
  // nobody before them to decide whether to skip it.
  if (form.value.steps[0]?.isMandatory === false)
    return 'Tahap pertama tidak bisa opsional — tidak ada penyetuju sebelumnya yang memutuskannya.'
  return ''
})

async function loadWorkflows() {
  loading.value = true
  workflows.value = await approvalService.listWorkflows()
  loading.value = false
}

async function submitForm() {
  if (formError.value !== '') return
  isSubmitting.value = true
  try {
    const ok = await approvalService.createWorkflow({
      name: form.value.name.trim(),
      targetEntity: TARGET_ENTITY,
      description: form.value.description.trim() || undefined,
      steps: form.value.steps.map((step, index) => ({
        stepSequence: index + 1,
        approverRoleCode: step.approverRoleCode.trim().toUpperCase(),
        isMandatory: step.isMandatory,
      })),
    })
    if (ok) {
      isFormOpen.value = false
      await loadWorkflows()
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadWorkflows()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader class="border-b px-6 py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight"
              >Alur Kerja Persetujuan (Workflow)</CardTitle
            >
            <p class="text-sm text-muted-foreground mt-1">
              Konfigurasi persetujuan berjenjang untuk peminjaman aset logistik
              sekolah.
            </p>
          </div>
          <Button
            v-if="can('inventory-approvals.create')"
            @click="openForm"
          >
            <Plus class="size-4 mr-1.5" />
            Susun Alur
          </Button>
        </div>
      </CardHeader>
      <CardContent class="p-6">
        <div
          v-if="loading"
          class="text-center text-sm text-muted-foreground py-8"
        >
          Memuat alur kerja...
        </div>

        <div
          v-else
          class="grid gap-6 md:grid-cols-2"
        >
          <Card
            v-for="wf in workflows"
            :key="wf.id"
            class="border shadow-none rounded-xl overflow-hidden bg-card"
          >
            <div class="p-5 border-b flex items-center justify-between">
              <div>
                <h3 class="font-bold text-lg text-foreground">
                  {{ wf.name }}
                </h3>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Entity Target:
                  <span
                    class="font-mono text-primary bg-primary/5 px-1.5 py-0.5 rounded"
                    >{{ wf.targetEntity }}</span
                  >
                </p>
              </div>
              <Badge :variant="wf.isActive ? 'default' : 'outline'">
                {{ wf.isActive ? 'Aktif' : 'Nonaktif' }}
              </Badge>
            </div>
            <div class="p-5 space-y-4">
              <p class="text-sm text-muted-foreground">
                {{ wf.description ?? 'Tidak ada deskripsi.' }}
              </p>

              <div class="space-y-2 pt-2 border-t">
                <h4
                  class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Tahapan Persetujuan
                </h4>

                <div class="flex flex-wrap items-center gap-2 py-1">
                  <template
                    v-for="(step, idx) in wf.steps"
                    :key="step.id"
                  >
                    <!-- Step badge -->
                    <div
                      class="flex items-center space-x-1.5 border px-3 py-1.5 rounded-lg bg-background text-sm font-medium"
                    >
                      <Shield class="size-4 text-primary" />
                      <span>{{ step.approverRoleCode }}</span>
                      <!--
                        An optional step is the difference between "this loan
                        needs two signatures" and "the first approver may ask
                        for a second", which is not visible from the role name.
                      -->
                      <span
                        v-if="!step.isMandatory"
                        class="text-xs font-normal text-muted-foreground"
                      >
                        (opsional)
                      </span>
                    </div>

                    <!-- Connector arrow -->
                    <ArrowRight
                      v-if="Number(idx) < wf.steps.length - 1"
                      class="size-4 text-muted-foreground shrink-0"
                    />
                  </template>
                </div>
              </div>
            </div>
          </Card>

          <!--
            Not a cosmetic empty state. With no active workflow the backend
            approves every loan the moment it is requested, which looks from the
            outside exactly like a system that is working.
          -->
          <div
            v-if="workflows.length === 0"
            class="col-span-2 rounded-xl border border-dashed p-8 text-center"
          >
            <p class="text-sm font-medium text-foreground">
              Belum ada alur persetujuan yang terkonfigurasi.
            </p>
            <p class="mt-1 text-sm text-muted-foreground">
              Selama belum ada alur aktif, setiap pengajuan peminjaman langsung
              disetujui tanpa melewati siapa pun.
            </p>
            <Button
              v-if="can('inventory-approvals.create')"
              class="mt-4"
              @click="openForm"
            >
              <Plus class="size-4 mr-1.5" />
              Susun Alur
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Compose workflow -->
  <Dialog
    :open="isFormOpen"
    @update:open="isFormOpen = $event"
  >
    <DialogContent class="sm:max-w-[560px]">
      <DialogHeader>
        <DialogTitle>Susun Alur Persetujuan</DialogTitle>
        <DialogDescription>
          Tentukan siapa yang menandatangani peminjaman, dan urutannya.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <div class="space-y-1">
          <Label for="wf-name">Nama Alur</Label>
          <Input
            id="wf-name"
            v-model="form.name"
            placeholder="Persetujuan Peminjaman Aset"
          />
        </div>

        <div class="space-y-1">
          <Label for="wf-description">Keterangan</Label>
          <Input
            id="wf-description"
            v-model="form.description"
            placeholder="Opsional"
          />
        </div>

        <div class="space-y-2">
          <Label>Tahapan</Label>
          <div
            v-for="(step, index) in form.steps"
            :key="index"
            class="rounded-lg border p-3 space-y-2"
          >
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-semibold text-muted-foreground w-14 shrink-0"
              >
                Tahap {{ index + 1 }}
              </span>
              <Input
                v-model="step.approverRoleCode"
                placeholder="Kode role, mis. ADMIN"
                class="font-mono"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                :disabled="form.steps.length === 1"
                @click="removeStep(index)"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>

            <!--
              The first step is reached the instant a loan is requested, so
              there is no earlier approver to decide whether to skip it.
            -->
            <div
              v-if="index > 0"
              class="flex items-center gap-2 pl-16"
            >
              <Checkbox
                :id="`wf-optional-${index}`"
                :model-value="!step.isMandatory"
                @update:model-value="step.isMandatory = $event !== true"
              />
              <Label
                :for="`wf-optional-${index}`"
                class="text-xs font-normal cursor-pointer text-muted-foreground"
              >
                Opsional — penyetuju sebelumnya yang memutuskan apakah tahap ini
                dilewati
              </Label>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            @click="addStep"
          >
            <Plus class="size-4 mr-1.5" />
            Tambah Tahap
          </Button>
        </div>

        <!--
          Saving replaces the active workflow, and an approval already running
          keeps the steps it started with. Saying so here beats discovering it.
        -->
        <p
          v-if="activeWorkflow"
          class="text-xs text-muted-foreground"
        >
          Menyimpan akan menonaktifkan alur "{{ activeWorkflow.name }}".
          Pengajuan yang sedang berjalan tetap memakai alur lamanya.
        </p>

        <p
          v-if="formError"
          class="text-xs text-destructive"
        >
          {{ formError }}
        </p>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          @click="isFormOpen = false"
          >Batal</Button
        >
        <Button
          type="button"
          :disabled="isSubmitting || formError !== ''"
          @click="submitForm"
        >
          Simpan Alur
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
