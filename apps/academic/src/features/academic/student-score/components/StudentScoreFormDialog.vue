<script setup lang="ts">
import { computed, reactive, ref, toRefs, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/ui/dialog'
import { ScrollArea } from '@/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/ui/alert-dialog'
import { Alert, AlertTitle, AlertDescription } from '@/ui/alert'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import { AlertCircle } from 'lucide-vue-next'
import type { StudentScoreRow } from '../types'
import { useStudentScore } from '../composables/useStudentScore'
import type { StudentScoreSavePayload } from '../types'

const props = defineProps<{
  open: boolean
  formError: string | null
  isSaving: boolean
  editData?: StudentScoreRow | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [
    scoresToSave: StudentScoreSavePayload[],
    scoresToUpdate: { id: string; payload: Partial<StudentScoreSavePayload> }[],
  ]
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) resetForm()
    emit('update:open', value)
  },
})

const { editData } = toRefs(props)
const isEditing = computed(
  () =>
    !!editData?.value?.scores && Object.keys(editData.value.scores).length > 0,
)

const { assessmentItems } = useStudentScore()

const formData = reactive<{
  scoresMap: Record<string, { id?: string; score?: number; notes?: string }>
}>({
  scoresMap: {},
})
const errors = reactive<Record<string, string>>({})

watch(
  () => [props.open, editData?.value] as const,
  ([isOpen]) => {
    const data = editData?.value
    if (isOpen && data) {
      resetForm()
      const scores = data.scores
      if (scores) {
        assessmentItems.value.forEach((item) => {
          if (scores[item.id]) {
            formData.scoresMap[item.id] = {
              id: scores[item.id]!.id,
              score: scores[item.id]!.score ?? undefined,
              notes: scores[item.id]!.notes ?? undefined,
            }
          } else {
            formData.scoresMap[item.id] = { score: undefined, notes: undefined }
          }
        })
      } else {
        assessmentItems.value.forEach((item) => {
          formData.scoresMap[item.id] = { score: undefined, notes: undefined }
        })
      }
    } else if (isOpen) {
      resetForm()
    }
  },
  { immediate: true },
)

function validate() {
  const errs: Record<string, string> = {}

  assessmentItems.value.forEach((item) => {
    const scoreVal = formData.scoresMap[item.id]?.score
    if (scoreVal !== undefined && (scoreVal < 0 || scoreVal > item.maxScore)) {
      errs[`score_${item.id}`] = `Nilai harus antara 0 - ${item.maxScore}`
    }
  })

  Object.assign(errors, errs)
  Object.keys(errors).forEach((k) => {
    if (!(k in errs)) delete errors[k]
  })
  return Object.keys(errs).length === 0
}

const showConfirmAlert = ref(false)

function resetForm() {
  formData.scoresMap = {}
  Object.keys(errors).forEach((k) => delete errors[k])
  showConfirmAlert.value = false
}

function preSave() {
  if (!validate()) return
  if (isEditing.value) {
    showConfirmAlert.value = true
  } else {
    submitSave()
  }
}

function submitSave() {
  showConfirmAlert.value = false

  const scoresToSave: StudentScoreSavePayload[] = []
  const scoresToUpdate: {
    id: string
    payload: Partial<StudentScoreSavePayload>
  }[] = []

  const enrollmentId = editData?.value?.enrollmentId
  if (!enrollmentId) return

  assessmentItems.value.forEach((item) => {
    const input = formData.scoresMap[item.id]
    if (input?.score !== undefined) {
      if (input.id) {
        scoresToUpdate.push({
          id: input.id,
          payload: {
            score: input.score,
            note: input.notes,
          },
        })
      } else {
        scoresToSave.push({
          enrollmentId,
          assessmentItemId: item.id,
          score: input.score,
          note: input.notes,
        })
      }
    }
  })

  emit('save', scoresToSave, scoresToUpdate)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-2xl flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>{{
          isEditing ? 'Edit Nilai Siswa' : 'Input Nilai Siswa'
        }}</DialogTitle>
        <DialogDescription>
          Data siswa:
          <strong class="text-foreground">{{
            editData?.student?.user?.profile?.name
          }}</strong>
          ({{ editData?.student?.nis }})
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <div class="px-6 py-4 space-y-4">
          <div
            v-if="assessmentItems.length === 0"
            class="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed"
          >
            Belum ada komponen penilaian yang ditambahkan. Silakan kelola
            komponen penilaian terlebih dahulu.
          </div>

          <div
            v-else
            class="grid gap-4 md:grid-cols-2"
          >
            <div
              v-for="item in assessmentItems"
              :key="item.id"
              class="grid gap-2 border p-3 rounded-lg shadow-sm"
            >
              <Label
                :for="`score_${item.id}`"
                class="font-semibold"
                >{{ item.name }} ({{ item.type }})</Label
              >
              <p class="text-xs text-muted-foreground">
                Bobot: {{ item.weight }} | Maksimal: {{ item.maxScore }}
              </p>
              <Input
                :id="`score_${item.id}`"
                v-model.number="formData.scoresMap[item.id]!.score"
                type="number"
                :placeholder="`0 - ${item.maxScore}`"
                min="0"
                :max="item.maxScore"
                :class="
                  errors[`score_${item.id}`]
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                "
                @input="delete errors[`score_${item.id}`]"
              />
              <p
                v-if="errors[`score_${item.id}`]"
                class="text-xs text-destructive"
              >
                {{ errors[`score_${item.id}`] }}
              </p>

              <Label
                :for="`notes_${item.id}`"
                class="mt-2 text-xs"
                >Catatan (Opsional)</Label
              >
              <Textarea
                :id="`notes_${item.id}`"
                v-model="formData.scoresMap[item.id]!.notes"
                placeholder="Catatan untuk nilai ini..."
                rows="2"
              />
            </div>
          </div>

          <Alert
            v-if="formError"
            variant="destructive"
            class="mt-2"
          >
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Kesalahan Sistem</AlertTitle>
            <AlertDescription>{{ formError }}</AlertDescription>
          </Alert>
        </div>
      </ScrollArea>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          variant="outline"
          :disabled="isSaving"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          variant="default"
          :disabled="isSaving || assessmentItems.length === 0"
          @click="preSave"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AlertDialog v-model:open="showConfirmAlert">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Simpan Perubahan Nilai?</AlertDialogTitle>
        <AlertDialogDescription>
          Apakah Anda yakin ingin menyimpan perubahan nilai untuk siswa ini?
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="isSaving"> Batal </AlertDialogCancel>
        <AlertDialogAction
          :disabled="isSaving"
          @click="submitSave"
        >
          Simpan
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
