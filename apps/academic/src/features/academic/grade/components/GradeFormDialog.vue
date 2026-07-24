<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useGradeForm } from '../composables/useGradeForm'
import { gradeAcademicYearService } from '../services/gradeAcademicYearService'
import type { Grade, GradeAcademicYear } from '../types'
import { Button } from '@/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { ScrollArea } from '@/ui/scroll-area'
import { Separator } from '@/ui/separator'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Alert, AlertDescription } from '@/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-vue-next'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { academicYearApi } from '@/features/academic/academic-year'
import { curriculaApi } from '@/features/academic/curriculum'
import type { AcademicYear } from '@/features/academic/academic-year'
import type { Curricula } from '@/features/academic/curriculum'

const props = defineProps<{
  open: boolean
  editData: Grade | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save-success': []
}>()

const open = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})

const { editData } = toRefs(props)

const levelForm = useGradeForm({
  editData: () => editData.value ?? null,
  onSuccess: () => {
    emit('save-success')
    open.value = false
  },
})

const academicYears = ref<AcademicYear[]>([])
const curricula = ref<Curricula[]>([])
const assignments = ref<GradeAcademicYear[]>([])
const loadingCurriculum = ref(false)
const savingCurriculum = ref<Record<string, boolean>>({})
const pendingCurriculum = ref<Record<string, string>>({})

const assignmentByAY = computed(() => {
  const map: Record<string, GradeAcademicYear> = {}
  for (const a of assignments.value) {
    map[a.academicYearId] = a
  }
  return map
})

function getCurrentCurriculumId(academicYearId: string): string {
  if (pendingCurriculum.value[academicYearId] !== undefined) {
    return pendingCurriculum.value[academicYearId]
  }
  return assignmentByAY.value[academicYearId]?.curriculumId ?? ''
}

function hasPending(academicYearId: string): boolean {
  if (pendingCurriculum.value[academicYearId] === undefined) return false
  const current = assignmentByAY.value[academicYearId]?.curriculumId ?? ''
  return pendingCurriculum.value[academicYearId] !== current
}

async function loadCurriculumData() {
  if (!editData.value) return
  loadingCurriculum.value = true
  try {
    const [ayRes, curRes, assRes] = await Promise.all([
      academicYearApi.getAcademicYears({ limit: 100 }),
      curriculaApi.getCurricula({ limit: 100 }),
      gradeAcademicYearService.getAssignments(),
    ])
    academicYears.value = ayRes.data?.data ?? []
    curricula.value = curRes.data?.data ?? []
    // Filter assignments hanya untuk grade ini
    assignments.value = assRes.filter((a) => a.gradeId === editData.value!.id)
  } finally {
    loadingCurriculum.value = false
  }
}

async function saveCurriculum(academicYearId: string) {
  if (!editData.value) return
  const curriculumId = pendingCurriculum.value[academicYearId]
  if (curriculumId === undefined) return

  savingCurriculum.value[academicYearId] = true
  try {
    if (curriculumId === '') {
      const existing = assignmentByAY.value[academicYearId]
      if (existing) {
        const result = await gradeAcademicYearService.remove(existing.id)
        if (result.success) {
          delete pendingCurriculum.value[academicYearId]
          await loadCurriculumData()
        }
      } else {
        delete pendingCurriculum.value[academicYearId]
      }
    } else {
      const result = await gradeAcademicYearService.assign({
        gradeId: editData.value.id,
        academicYearId,
        curriculumId,
      })
      if (result.success) {
        delete pendingCurriculum.value[academicYearId]
        await loadCurriculumData()
      }
    }
  } finally {
    savingCurriculum.value[academicYearId] = false
  }
}

watch(open, async (isOpen) => {
  if (isOpen && editData.value) {
    pendingCurriculum.value = {}
    await loadCurriculumData()
  }
})

onMounted(async () => {
  if (props.open && editData.value) {
    await loadCurriculumData()
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent class="sm:max-w-md flex flex-col gap-0 p-0 overflow-hidden">
      <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
        <DialogTitle>
          {{
            levelForm.isEditing.value
              ? 'Edit Tingkat Kelas'
              : 'Tambah Tingkat Kelas'
          }}
        </DialogTitle>
        <DialogDescription class="sr-only"> </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form
          id="grade-form"
          class="space-y-4 px-6 py-4"
          @submit.prevent="levelForm.onSubmit"
        >
          <FormField
            v-slot="{ value, handleChange }"
            name="level"
          >
            <FormItem>
              <FormLabel
                >Tingkat <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  id="cl-level"
                  type="number"
                  min="1"
                  max="15"
                  placeholder="Contoh: 7"
                  :model-value="value"
                  @update:model-value="(val) => handleChange(Number(val))"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ componentField }"
            name="name"
          >
            <FormItem>
              <FormLabel
                >Nama Tingkat <span class="text-destructive">*</span></FormLabel
              >
              <FormControl>
                <Input
                  id="cl-name"
                  placeholder="Contoh: VII"
                  v-bind="componentField"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            name="isActive"
          >
            <FormItem>
              <FormLabel
                >Status <span class="text-destructive">*</span></FormLabel
              >
              <Select
                :model-value="value ? 'true' : 'false'"
                @update:model-value="(val) => handleChange(val === 'true')"
              >
                <FormControl>
                  <SelectTrigger
                    id="cl-status"
                    class="w-full"
                  >
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true"> Aktif </SelectItem>
                  <SelectItem value="false"> Nonaktif </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          </FormField>

          <Alert
            v-if="levelForm.formError.value"
            variant="destructive"
            class="mt-2"
          >
            <AlertCircle class="size-4" />
            <AlertDescription>{{ levelForm.formError.value }}</AlertDescription>
          </Alert>
        </form>

        <!-- Kurikulum per Tahun Ajaran (edit mode only) -->
        <template v-if="levelForm.isEditing.value">
          <Separator class="mx-6" />
          <div class="px-6 py-4 space-y-3">
            <div>
              <p class="text-sm font-medium">Kurikulum per Tahun Ajaran</p>
              <p class="text-xs text-muted-foreground mt-0.5">
                Tetapkan kurikulum yang berlaku untuk tingkat ini di setiap
                tahun ajaran.
              </p>
            </div>

            <div
              v-if="loadingCurriculum"
              class="flex justify-center py-4"
            >
              <Loader2 class="size-4 animate-spin text-muted-foreground" />
            </div>

            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="ay in academicYears"
                :key="ay.id"
                class="space-y-1.5"
              >
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-medium text-foreground">{{
                    ay.name
                  }}</span>
                  <span
                    v-if="ay.isActive"
                    class="text-xs text-emerald-600 font-medium"
                    >(Aktif)</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <Select
                    :model-value="getCurrentCurriculumId(ay.id)"
                    @update:model-value="
                      (v) => (pendingCurriculum[ay.id] = String(v ?? ''))
                    "
                  >
                    <SelectTrigger class="h-8 flex-1 text-xs">
                      <SelectValue placeholder="Pilih kurikulum..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        <span class="text-muted-foreground">Tidak ada</span>
                      </SelectItem>
                      <SelectItem
                        v-for="c in curricula"
                        :key="c.id"
                        :value="c.id"
                      >
                        {{ c.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    v-if="hasPending(ay.id)"
                    size="sm"
                    class="h-8 text-xs shrink-0"
                    :disabled="savingCurriculum[ay.id]"
                    @click="saveCurriculum(ay.id)"
                  >
                    <Loader2
                      v-if="savingCurriculum[ay.id]"
                      class="size-3 mr-1 animate-spin"
                    />
                    Simpan
                  </Button>
                  <Button
                    v-if="hasPending(ay.id)"
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 shrink-0"
                    @click="delete pendingCurriculum[ay.id]"
                  >
                    ✕
                  </Button>
                </div>
              </div>
              <p
                v-if="academicYears.length === 0"
                class="text-xs text-muted-foreground"
              >
                Belum ada tahun ajaran.
              </p>
            </div>
          </div>
        </template>
      </ScrollArea>

      <DialogFooter
        class="px-6 py-4 border-t shrink-0 flex sm:justify-between w-full bg-background"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="levelForm.isSaving.value"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="submit"
          form="grade-form"
          :disabled="levelForm.isSaving.value"
        >
          <Loader2
            v-if="levelForm.isSaving.value"
            class="size-4 mr-2 animate-spin"
          />
          {{ levelForm.isSaving.value ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
