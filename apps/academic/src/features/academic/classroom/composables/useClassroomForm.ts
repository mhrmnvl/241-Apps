import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { classroomService } from '../services/classroomService'
import { useClassroomStore } from '../stores/classroomStore'
import type { Classroom, ClassroomSavePayload, AcademicYear } from '../types'

export function useClassroomForm(options?: {
  academicYears?: () => AcademicYear[]
  editData?: () => Classroom | null
  onSuccess?: () => void | Promise<void>
}) {
  const store = useClassroomStore()
  const { isSaving, formError } = storeToRefs(store)
  const showConfirmAlert = ref(false)

  const activeAcademicYears = computed(() =>
    (options?.academicYears?.() ?? []).filter((ay) => ay.isActive),
  )

  const formSchema = toTypedSchema(
    z.object({
      academicYearId: z.string().min(1, 'Tahun ajaran wajib dipilih.'),
      gradeId: z.string().min(1, 'Tingkat wajib dipilih.'),
      code: z.string().min(1, 'Kode kelas wajib diisi.').max(20),
      name: z
        .string()
        .max(100, 'Nama kelas tidak boleh lebih dari 100 karakter.')
        .optional()
        .nullable(),
      capacity: z
        .number({ invalid_type_error: 'Kapasitas harus berupa angka' })
        .min(1, 'Kapasitas minimal 1.')
        .max(100, 'Kapasitas tidak boleh lebih dari 100 siswa.'),
      isActive: z.boolean().default(true),
    }),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      academicYearId: '',
      gradeId: '',
      code: '',
      name: '',
      capacity: 30,
      isActive: true,
    },
  })

  function setDefaultAcademicYear() {
    const years = options?.academicYears?.() ?? []
    if (!form.values.academicYearId && years.length > 0) {
      const activeAy = years.find((ay) => ay.isActive)
      form.setValues({
        academicYearId: activeAy ? activeAy.id : (years[0]?.id ?? ''),
      })
    }
  }

  watch(
    () => options?.editData?.(),
    (data) => {
      if (data) {
        form.setValues({
          academicYearId: data.academicYearId ?? '',
          gradeId: data.gradeId ?? data.classroomLevelId ?? '',
          code: data.code ?? '',
          name: data.name ?? '',
          capacity: Number(data.capacity) || 30,
          isActive: data.isActive ?? false,
        })
      } else {
        form.resetForm()
        setDefaultAcademicYear()
      }
    },
    { immediate: true },
  )

  watch(
    () => options?.academicYears?.(),
    (years) => {
      if (years && years.length > 0 && !form.values.academicYearId) {
        setDefaultAcademicYear()
      }
    },
    { immediate: true },
  )

  const isEditing = computed(() => !!options?.editData?.())

  const onSubmit = form.handleSubmit((values) => {
    if (isEditing.value) {
      showConfirmAlert.value = true
    } else {
      void executeSave(values)
    }
  })

  async function executeSave(values: {
    academicYearId: string
    gradeId: string
    code: string
    name?: string | null
    capacity: number
    isActive: boolean
  }) {
    const editItem = options?.editData?.()
    const payload: ClassroomSavePayload = {
      academicYearId: values.academicYearId,
      gradeId: values.gradeId,
      code: values.code.trim(),
      name: values.name ? values.name.trim() : null,
      capacity: values.capacity,
      isActive: values.isActive,
    }
    const result = await classroomService.saveClassroom(
      editItem?.id ?? null,
      payload,
    )
    if (result.success) {
      if (options?.onSuccess) {
        await options.onSuccess()
      }
      form.resetForm()
    }
  }

  function confirmSave() {
    showConfirmAlert.value = false
    void form.handleSubmit(executeSave)()
  }

  return {
    form,
    isSaving,
    formError,
    isEditing,
    showConfirmAlert,
    activeAcademicYears,
    onSubmit,
    confirmSave,
  }
}
