import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import * as z from 'zod'
import { semesterService } from '../services/semesterService'
import { useSemesterStore } from '../stores/semesterStore'
import type { AcademicYearRef, Semester, SemesterSavePayload } from '../types'

function toDateOnly(val?: string | null): string {
  if (!val) return ''
  return val.substring(0, 10)
}

interface SemesterFormValues {
  academicYearId: string
  typeId: string
  startDate: string
  endDate: string
}

export function useSemesterForm(options?: {
  academicYears: () => AcademicYearRef[]
  editData?: () => Semester | null
  onSuccess?: () => void | Promise<void>
}) {
  const store = useSemesterStore()
  const { isSaving, formError, semesterTypes } = storeToRefs(store)

  const formSchema = toTypedSchema(
    z
      .object({
        academicYearId: z.string().min(1, 'Tahun Ajaran wajib dipilih.'),
        typeId: z.string().min(1, 'Semester wajib dipilih.'),
        startDate: z.string().optional().default(''),
        endDate: z.string().optional().default(''),
      })
      .refine(
        (data) => {
          if (data.startDate && data.endDate) {
            return data.startDate <= data.endDate
          }
          return true
        },
        {
          message: 'Tanggal selesai harus setelah tanggal mulai.',
          path: ['endDate'],
        },
      ),
  )

  const form = useForm({
    validationSchema: formSchema,
    initialValues: {
      academicYearId: '',
      typeId: '',
      startDate: '',
      endDate: '',
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
    [() => options?.editData?.(), semesterTypes],
    ([data, types]) => {
      if (data) {
        form.setValues({
          academicYearId: data.academicYearId,
          typeId: data.typeId,
          startDate: toDateOnly(data.startDate),
          endDate: toDateOnly(data.endDate),
        })
      } else {
        const years = options?.academicYears() ?? []
        const activeAy = years.find((ay) => ay.isActive)
        const oddType = types.find((t) => t.name === 'ODD')
        form.resetForm({
          values: {
            academicYearId: activeAy ? activeAy.id : (years[0]?.id ?? ''),
            typeId: oddType?.id ?? '',
            startDate: '',
            endDate: '',
          },
        })
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

  const onSubmit = form.handleSubmit(async (values: SemesterFormValues) => {
    const editItem = options?.editData?.()
    const payload: SemesterSavePayload = {
      academicYearId: values.academicYearId,
      typeId: values.typeId,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
    }
    const result = await semesterService.saveSemester(
      editItem?.id ?? null,
      payload,
    )
    if (result.success) {
      if (options?.onSuccess) {
        await options.onSuccess()
      }
      form.resetForm()
    }
  })

  return {
    form,
    isSaving,
    formError,
    isEditing,
    semesterTypes,
    onSubmit,
  }
}
