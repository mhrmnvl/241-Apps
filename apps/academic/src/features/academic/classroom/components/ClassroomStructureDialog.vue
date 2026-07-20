<script setup lang="ts">
import { reactive, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import type {
  ClassroomEnrollment,
  ClassroomStructure,
  TeacherOption,
  StructureFormValues,
  PopoverStates,
} from '../types'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Button } from '@/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { FormField, FormItem, FormLabel, FormMessage } from '@/ui/form'
import { cn, formatEntityName } from '@/shared/utils/utils'
import { Check, ChevronsUpDown, UserCircle } from 'lucide-vue-next'

const props = defineProps<{
  open: boolean
  teachers: TeacherOption[]
  enrollments: ClassroomEnrollment[]
  classroomStructure: ClassroomStructure | null
  currentTeacherId: string | null
  isSaving: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [values: StructureFormValues]
}>()

const formSchema = toTypedSchema(
  z.object({
    supervisorId: z.string().min(1, 'Wali kelas wajib dipilih.'),
    presidentId: z.string().optional().default(''),
    vicePresidentId: z.string().optional().default(''),
    secretaryId: z.string().optional().default(''),
    treasurerId: z.string().optional().default(''),
  }),
)

const {
  handleSubmit,
  setValues,
  values: formValues,
} = useForm<StructureFormValues>({
  validationSchema: formSchema,
  initialValues: {
    supervisorId: '',
    presidentId: '',
    vicePresidentId: '',
    secretaryId: '',
    treasurerId: '',
  },
})

const findStudentEnrollmentId = (studentId?: string | null): string => {
  if (!studentId) return ''
  const enrollment = props.enrollments.find((e) => e.student.id === studentId)
  return enrollment?.id ?? ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      const structure = props.classroomStructure
      setValues({
        supervisorId: props.currentTeacherId ?? '',
        presidentId: findStudentEnrollmentId(structure?.presidentId),
        vicePresidentId: findStudentEnrollmentId(structure?.vicePresidentId),
        secretaryId: findStudentEnrollmentId(structure?.secretaryId),
        treasurerId: findStudentEnrollmentId(structure?.treasurerId),
      })
    }
  },
)

const teacherLabel = (e: TeacherOption) =>
  formatEntityName(e.user?.profile?.name ?? '')

const studentLabel = (enrollmentId: string) => {
  if (!enrollmentId) return ''
  const enrollment = props.enrollments.find((e) => e.id === enrollmentId)
  return enrollment
    ? formatEntityName(enrollment.student.user.profile.name)
    : ''
}

const onSubmit = handleSubmit((values) => {
  const studentIdFromEnrollment = (enrollmentId: string): string | null => {
    if (!enrollmentId) return null
    const enrollment = props.enrollments.find((e) => e.id === enrollmentId)
    return enrollment?.studentId ?? null
  }

  emit('save', {
    supervisorId: values.supervisorId,
    presidentId: studentIdFromEnrollment(values.presidentId) ?? '',
    vicePresidentId: studentIdFromEnrollment(values.vicePresidentId) ?? '',
    secretaryId: studentIdFromEnrollment(values.secretaryId) ?? '',
    treasurerId: studentIdFromEnrollment(values.treasurerId) ?? '',
  })
})

const popoverStates = reactive<PopoverStates>({
  supervisorId: { open: false },
  presidentId: { open: false },
  vicePresidentId: { open: false },
  secretaryId: { open: false },
  treasurerId: { open: false },
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent class="sm:max-w-lg max-h-[85vh] flex flex-col">
      <DialogHeader>
        <DialogTitle>Kelola Struktur Kelas</DialogTitle>
      </DialogHeader>

      <form
        class="flex-1 overflow-y-auto space-y-5 py-2"
        @submit="onSubmit"
      >
        <FormField
          v-slot="{ setValue }"
          name="supervisorId"
        >
          <FormItem>
            <FormLabel>
              Wali Kelas <span class="text-destructive">*</span>
            </FormLabel>
            <Popover
              :open="popoverStates.supervisorId.open"
              @update:open="popoverStates.supervisorId.open = $event"
            >
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="popoverStates.supervisorId.open"
                  :disabled="isSaving"
                  :class="
                    cn(
                      'h-10 w-full justify-between',
                      !formValues.supervisorId && 'text-muted-foreground',
                    )
                  "
                >
                  <div class="flex items-center gap-2 truncate">
                    <UserCircle class="h-4 w-4 shrink-0 opacity-50" />
                    <span class="truncate">
                      {{
                        formValues.supervisorId
                          ? teacherLabel(
                              teachers.find(
                                (e) => e.id === formValues.supervisorId,
                              )!,
                            )
                          : 'Pilih guru...'
                      }}
                    </span>
                  </div>
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                class="w-(--reka-popover-trigger-width) p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Cari nama guru..."
                    class="h-9 text-sm"
                  />
                  <CommandEmpty>Guru tidak ditemukan.</CommandEmpty>
                  <CommandList class="max-h-[180px]">
                    <CommandGroup>
                      <CommandItem
                        v-for="teacher in teachers"
                        :key="teacher.id"
                        :value="`${teacherLabel(teacher)} ${teacher.nip ?? ''} ${teacher.id}`"
                        @select="
                          () => {
                            setValue(teacher.id)
                            popoverStates.supervisorId.open = false
                          }
                        "
                      >
                        <Check
                          :class="
                            cn(
                              'mr-2 h-4 w-4 shrink-0',
                              formValues.supervisorId === teacher.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )
                          "
                        />
                        <div class="min-w-0 flex flex-col items-start">
                          <p class="truncate text-sm font-medium">
                            {{ teacherLabel(teacher) }}
                          </p>
                          <p
                            v-if="teacher.nip"
                            class="text-xs text-muted-foreground"
                          >
                            {{ teacher.nip }}
                          </p>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField
          v-for="field in [
            { name: 'presidentId' as const, label: 'Ketua Kelas' },
            { name: 'vicePresidentId' as const, label: 'Wakil Ketua' },
            { name: 'secretaryId' as const, label: 'Sekretaris' },
            { name: 'treasurerId' as const, label: 'Bendahara' },
          ]"
          :key="field.name"
          v-slot="{ setValue }"
          :name="field.name"
        >
          <FormItem>
            <FormLabel>{{ field.label }}</FormLabel>
            <Popover
              :open="popoverStates[field.name].open"
              @update:open="popoverStates[field.name].open = $event"
            >
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="popoverStates[field.name].open"
                  :disabled="isSaving"
                  :class="
                    cn(
                      'h-10 w-full justify-between',
                      !formValues[field.name] && 'text-muted-foreground',
                    )
                  "
                >
                  <div class="flex items-center gap-2 truncate">
                    <UserCircle class="h-4 w-4 shrink-0 opacity-50" />
                    <span class="truncate">
                      {{
                        formValues[field.name]
                          ? studentLabel(formValues[field.name])
                          : 'Pilih siswa...'
                      }}
                    </span>
                  </div>
                  <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                class="w-(--reka-popover-trigger-width) p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder="Cari nama siswa..."
                    class="h-9 text-sm"
                  />
                  <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                  <CommandList class="max-h-[180px]">
                    <CommandGroup>
                      <CommandItem
                        value="-"
                        @select="
                          () => {
                            setValue('')
                            popoverStates[field.name].open = false
                          }
                        "
                      >
                        <Check
                          :class="
                            cn(
                              'mr-2 h-4 w-4 shrink-0',
                              !formValues[field.name]
                                ? 'opacity-100'
                                : 'opacity-0',
                            )
                          "
                        />
                        <span class="text-muted-foreground italic"
                          >Belum diatur / Kosongkan</span
                        >
                      </CommandItem>
                      <CommandItem
                        v-for="enrollment in enrollments"
                        :key="enrollment.id"
                        :value="`${enrollment.student.user.profile.name} ${enrollment.student.nis}`"
                        @select="
                          () => {
                            setValue(enrollment.id)
                            popoverStates[field.name].open = false
                          }
                        "
                      >
                        <Check
                          :class="
                            cn(
                              'mr-2 h-4 w-4 shrink-0',
                              formValues[field.name] === enrollment.id
                                ? 'opacity-100'
                                : 'opacity-0',
                            )
                          "
                        />
                        <div class="min-w-0 flex flex-col items-start">
                          <p class="truncate text-sm font-medium">
                            {{
                              formatEntityName(
                                enrollment.student.user.profile.name,
                              )
                            }}
                          </p>
                          <p class="text-xs text-muted-foreground">
                            {{ enrollment.student.nis }}
                          </p>
                        </div>
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </FormField>
      </form>

      <DialogFooter>
        <Button
          variant="outline"
          :disabled="isSaving"
          @click="emit('update:open', false)"
        >
          Batal
        </Button>
        <Button
          :disabled="isSaving"
          @click="onSubmit"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
