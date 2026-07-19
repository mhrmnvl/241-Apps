import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { curriculaService } from '../services/curriculaService'
import { useCurriculaStore } from '../stores/curriculaStore'
import { formatEntityName } from '@/shared/utils/utils'
import type { AcademicYearRef, Curricula, CurriculaSavePayload } from '../types'

export function useCurriculaForm(options?: {
  academicYears: () => AcademicYearRef[]
  editData?: () => Curricula | null
  onSuccess?: () => void | Promise<void>
}) {
  const store = useCurriculaStore()
  const { isSaving, formError } = storeToRefs(store)
  const showConfirmAlert = ref(false)

  const academicYearOptions = computed(() =>
    (options?.academicYears() ?? []).map((ay) => ({
      value: ay.id,
      label: formatEntityName(ay.name),
    })),
  )

  const formSchema = toTypedSchema(
    z.object({
      academicYearId: z.string().min(1, 'Tahun ajaran wajib dipilih.'),
      name: z
        .string()
        .min(1, 'Nama kurikulum wajib diisi.')
        .min(3, 'Nama kurikulum minimal 3 karakter.'),
      isActive: z.boolean().default(true),
    }),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      academicYearId: '',
      name: '',
      isActive: true,
    },
  })

  function setDefaultAcademicYear() {
    const years = options?.academicYears() ?? []
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
          academicYearId: data.academicYearId,
          name: data.name,
          isActive: data.isActive,
        })
      } else {
        form.resetForm()
        setDefaultAcademicYear()
      }
    },
    { immediate: true },
  )

  watch(
    () => options?.academicYears(),
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
    name: string
    isActive: boolean
  }) {
    const editItem = options?.editData?.()
    const payload: CurriculaSavePayload = {
      academicYearId: values.academicYearId,
      name: values.name.trim(),
      isActive: values.isActive,
    }
    const result = await curriculaService.saveCurriculum(
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
    academicYearOptions,
    onSubmit,
    confirmSave,
  }
}
