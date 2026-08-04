<script setup lang="ts">
import { computed, ref, reactive, watch, onMounted } from 'vue'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Loader2 } from 'lucide-vue-next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import api from '@/shared/utils/api'
import { useStudent } from '@/features/academic/student'
import { useTeacher } from '@/features/academic/teacher'
import type {
  SchoolProfileData,
  RawProfileData,
} from '@/features/platform/profile'
import type { EmploymentType } from '@/features/academic/employment-type'

const props = defineProps<{
  data: SchoolProfileData
  rawProfile?: RawProfileData | null
  isEditable: boolean
}>()

const emit = defineEmits<{
  reload: []
}>()

const isStudent = computed(() => props.data.roles?.includes('STUDENT'))

const { isSaving: isSavingStudent, saveStudent } = useStudent()
const { isSaving: isSavingTeacher, saveTeacher } = useTeacher()
const isSaving = computed(() => isSavingStudent.value || isSavingTeacher.value)

const additionalPositions = computed(() => {
  return (
    props.rawProfile?.teacher?.teacherPositions
      ?.filter((tp) => !tp.isPrimary)
      ?.map((tp) => tp.position?.name)
      ?.filter(Boolean) ?? []
  )
})

const taughtSubjects = computed(() => {
  return (
    props.rawProfile?.teacher?.teachingAssignments
      ?.map((sa) => sa.subject?.name)
      ?.filter(Boolean) ?? []
  )
})

const form = reactive({
  nis: '',
  nisn: '',
  nip: '',
  nuptk: '',
  employmentTypeId: undefined as string | undefined,
})

const employmentTypes = ref<EmploymentType[]>([])

watch(
  () => props.rawProfile,
  (raw) => {
    if (raw) {
      form.nis = raw.student?.nis ?? ''
      form.nisn = raw.student?.nisn ?? ''
      form.nip = raw.teacher?.nip ?? ''
      form.nuptk = raw.teacher?.nuptk ?? ''
      form.employmentTypeId = raw.teacher?.employmentType?.id ?? undefined
    }
  },
  { immediate: true },
)

onMounted(async () => {
  if (!isStudent.value) {
    try {
      const res = await api.get<{ data: EmploymentType[] }>(
        '/employment-types',
        {
          params: { limit: 100 },
        },
      )
      employmentTypes.value = res.data.data ?? []
    } catch {
      // non-blocking
    }
  }
})

async function handleSubmit() {
  if (!props.isEditable) return
  if (isStudent.value) {
    const studentId = props.rawProfile?.student?.id
    if (!studentId) return
    const { success } = await saveStudent(studentId, {
      nis: form.nis === '' ? undefined : form.nis,
      nisn: form.nisn === '' ? undefined : form.nisn,
    })
    if (success) {
      emit('reload')
    }
  } else {
    const teacherId = props.rawProfile?.teacher?.id
    if (!teacherId) return
    const { success } = await saveTeacher(teacherId, {
      nip: form.nip === '' ? undefined : form.nip,
      nuptk: form.nuptk === '' ? undefined : form.nuptk,
      employmentTypeId:
        !form.employmentTypeId || form.employmentTypeId === 'none'
          ? undefined
          : form.employmentTypeId,
    })
    if (success) {
      emit('reload')
    }
  }
}
</script>

<template>
  <div class="py-4">
    <div v-if="data.schoolIdentity">
      <form
        class="space-y-6"
        @submit.prevent="handleSubmit"
      >
        <div v-if="isStudent">
          <div class="grid gap-5 md:grid-cols-2">
            <!-- NIS -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">NIS</label>
              <Input
                v-model="form.nis"
                placeholder="Nomor Induk Siswa"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- NISN -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">NISN</label>
              <Input
                v-model="form.nisn"
                placeholder="Nomor Induk Siswa Nasional"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- Kelas Saat Ini -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Kelas Saat Ini</label
              >
              <Input
                :model-value="data.schoolIdentity.className || '-'"
                disabled
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- Tingkat Kelas -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Tingkat Kelas</label
              >
              <Input
                :model-value="
                  data.schoolIdentity.gradeLevel
                    ? `Level ${data.schoolIdentity.gradeLevel}`
                    : '-'
                "
                disabled
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- Dosen / Wali Kelas -->
            <div class="space-y-1.5 md:col-span-2">
              <label class="text-xs font-semibold text-foreground"
                >Dosen / Wali Kelas</label
              >
              <Input
                :model-value="data.schoolIdentity.supervisorName || '-'"
                disabled
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>
          </div>
        </div>

        <div v-else>
          <div class="grid gap-5 md:grid-cols-2">
            <!-- NIP -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">NIP</label>
              <Input
                v-model="form.nip"
                placeholder="Nomor Induk Guru"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- NUPTK -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground">NUPTK</label>
              <Input
                v-model="form.nuptk"
                placeholder="Nomor Unik Pendidik"
                :disabled="!isEditable"
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- Status Kepegawaian -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Status Kepegawaian</label
              >
              <Select
                v-model="form.employmentTypeId"
                :disabled="!isEditable"
              >
                <SelectTrigger
                  class="w-full disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                >
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Pilih Status</SelectItem>
                  <SelectItem
                    v-for="et in employmentTypes"
                    :key="et.id"
                    :value="et.id"
                  >
                    {{ et.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Tanggal Bergabung -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Tanggal Bergabung</label
              >
              <Input
                :model-value="data.schoolIdentity.hireDate || '-'"
                disabled
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- Jabatan Utama -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Jabatan Utama</label
              >
              <Input
                :model-value="data.schoolIdentity.primaryPosition || '-'"
                disabled
                class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
              />
            </div>

            <!-- Mata Pelajaran Diampu -->
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-foreground"
                >Mata Pelajaran Diampu</label
              >
              <div class="space-y-1.5">
                <template v-if="taughtSubjects.length > 0">
                  <Input
                    v-for="(sub, idx) in taughtSubjects"
                    :key="idx"
                    :model-value="sub"
                    disabled
                    class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                  />
                </template>
                <Input
                  v-else
                  model-value="-"
                  disabled
                  class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                />
              </div>
            </div>

            <!-- Jabatan Tambahan (Hanya muncul jika ada data) -->
            <div
              v-if="additionalPositions.length > 0"
              class="space-y-1.5 md:col-span-2"
            >
              <label class="text-xs font-semibold text-foreground"
                >Jabatan Tambahan</label
              >
              <div class="space-y-1.5">
                <Input
                  v-for="(pos, idx) in additionalPositions"
                  :key="idx"
                  :model-value="pos"
                  disabled
                  class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          v-if="isEditable"
          class="flex justify-end gap-3 pt-4"
        >
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
    </div>
    <div
      v-else
      class="text-center p-8 bg-muted/20 border-2 border-dashed rounded-lg"
    >
      <p class="text-muted-foreground">Data identitas belum tersedia.</p>
    </div>
  </div>
</template>
