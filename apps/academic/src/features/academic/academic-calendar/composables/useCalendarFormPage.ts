import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as z from 'zod'
import { parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { DateRange } from 'reka-ui'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type { CalendarEventData, CalendarSavePayload } from '../types'
import { useAcademicYearList } from '@/features/academic/academic-year'
import type { AcademicYear } from '@/features/academic/academic-year'
import { useAcademicCalendar } from './useAcademicCalendar'
import { academicCalendarApi } from '../api/academicCalendarApi'

const calendarFormSchema = toTypedSchema(
  z
    .object({
      title: z.string().min(1, 'Nama agenda harus diisi'),
      description: z.string().optional(),
      typeId: z.string().min(1, 'Kategori harus dipilih'),
      startDate: z.string().min(1, 'Tanggal mulai harus diisi'),
      endDate: z.string().min(1, 'Tanggal selesai harus diisi'),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      academicYearId: z.string().optional(),
    })
    // Both or neither, mirroring the rule the use case already enforces. Left
    // to the server, filling only one returns a generic failure with nothing
    // pointing at the field that caused it.
    .refine((v) => !v.startTime === !v.endTime, {
      message: 'Isi jam mulai dan jam selesai, atau kosongkan keduanya',
      path: ['endTime'],
    })
    .refine((v) => !v.startTime || !v.endTime || v.endTime > v.startTime, {
      message: 'Jam selesai harus setelah jam mulai',
      path: ['endTime'],
    }),
)

export function useCalendarFormPage() {
  const route = useRoute()
  const router = useRouter()
  const { saveCalendar, deleteCalendar } = useAcademicCalendar()

  const eventId = computed(() => (route.params.id as string) || null)
  const isEditMode = computed(() => !!eventId.value)
  const isLoadingEvent = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const eventData = ref<CalendarEventData | null>(null)

  const { handleSubmit, resetForm, setValues, setFieldValue, values } = useForm(
    {
      validationSchema: calendarFormSchema,
      initialValues: {
        title: '',
        description: '',
        typeId: '',
        startDate: '',
        endDate: '',
        startTime: '',
        endTime: '',
        academicYearId: '',
      },
    },
  )

  const { academicYears, fetchAcademicYears } = useAcademicYearList()

  const activeAcademicYear = computed(
    () =>
      academicYears.value.find((ay: AcademicYear) => ay.isActive) ??
      academicYears.value[0] ??
      null,
  )

  const dateRangeOpen = ref(false)

  const dateRangeValue = computed<DateRange>({
    get() {
      const s = values.startDate ?? ''
      const e = values.endDate ?? ''
      return {
        start: s ? parseDate(s.split('T')[0]!) : undefined,
        end: e ? parseDate(e.split('T')[0]!) : undefined,
      }
    },
    set(val: DateRange) {
      setFieldValue('startDate', val.start ? val.start.toString() : '')
      setFieldValue('endDate', val.end ? val.end.toString() : '')
    },
  })

  function handleRangeUpdate(val: DateRange) {
    dateRangeValue.value = val
    if (val.start && val.end) dateRangeOpen.value = false
  }

  function formatDateLabel(dv?: DateValue): string {
    if (!dv) return ''
    return format(new Date(dv.toString()), 'dd MMM yyyy', { locale: idLocale })
  }

  const dateRangeLabel = computed(() => {
    const s = dateRangeValue.value.start
    const e = dateRangeValue.value.end
    if (!s && !e) return ''
    if (s && !e) return formatDateLabel(s)
    if (s && e) return `${formatDateLabel(s)} — ${formatDateLabel(e)}`
    return ''
  })

  // Populate form for edit mode
  function populateForm(data: CalendarEventData) {
    const activeYearId = activeAcademicYear.value?.id ?? ''
    setValues({
      title: data.title,
      description: data.description ?? '',
      typeId: data.typeId,
      startDate: data.startDate.slice(0, 10),
      endDate: data.endDate.slice(0, 10),
      startTime: data.startTime?.slice(11, 16) ?? '',
      endTime: data.endTime?.slice(11, 16) ?? '',
      academicYearId: data.academicYearId ?? activeYearId,
    })
  }

  // Populate form for create with pre-selected date
  function populateCreateForm(selectedDate?: string) {
    const activeYearId = activeAcademicYear.value?.id ?? ''
    const start = selectedDate ?? ''
    resetForm({
      values: {
        title: '',
        description: '',
        typeId: '',
        startDate: start,
        endDate: start,
        academicYearId: activeYearId,
      },
    })
  }

  async function loadEventDetails(id: string) {
    isLoadingEvent.value = true
    try {
      const res = await academicCalendarApi.getCalendarById(id)
      const data = res.data.data
      if (data) {
        eventData.value = data
        populateForm(data)
      }
    } catch (error) {
      toast.error(
        getIndonesianErrorMessage(
          error,
          'Gagal memuat detail agenda kalender.',
        ),
      )
      void router.push('/academic/education-calendar/manage')
    } finally {
      isLoadingEvent.value = false
    }
  }

  onMounted(async () => {
    await fetchAcademicYears()

    if (isEditMode.value && eventId.value) {
      // The row the table already had, handed over through history state so
      // opening an edit form from the list costs no request. Typed at the
      // boundary because `history.state` is `any` — the cast belongs here,
      // once, rather than spreading unchecked access through the function.
      const navigationState = history.state as
        | { eventData?: CalendarEventData }
        | null
        | undefined
      const state = navigationState?.eventData
      if (state) {
        eventData.value = state
        populateForm(state)
      } else {
        await loadEventDetails(eventId.value)
      }
    } else {
      const selectedDate = (route.query.date as string) || ''
      populateCreateForm(selectedDate)
    }
  })

  watch(activeAcademicYear, (ay) => {
    if (ay && !values.academicYearId) {
      setFieldValue('academicYearId', ay.id)
    }
  })

  const onSubmit = handleSubmit(async (vals) => {
    isSaving.value = true
    try {
      const payload: Partial<CalendarSavePayload> = {
        title: vals.title,
        typeId: vals.typeId,
        // Plain dates. The columns are `@db.Date` and the calendar's unit is
        // the day; appending a clock time makes the server parse it in its own
        // timezone, and `T00:00:00` read as UTC+07 lands on the previous day.
        startDate: vals.startDate,
        endDate: vals.endDate,
      }

      if (vals.description) {
        payload.description = vals.description
      }

      payload.startTime = vals.startTime || undefined
      payload.endTime = vals.endTime || undefined
      payload.academicYearId =
        vals.academicYearId ?? activeAcademicYear.value?.id

      const success = await saveCalendar(
        eventId.value,
        payload as CalendarSavePayload,
      )
      if (success) {
        void router.push('/academic/education-calendar/manage')
      }
    } finally {
      isSaving.value = false
    }
  })

  async function onDelete() {
    if (!eventId.value) return
    isDeleting.value = true
    try {
      const success = await deleteCalendar(eventId.value)
      if (success) {
        void router.push('/academic/education-calendar/manage')
      }
    } finally {
      isDeleting.value = false
    }
  }

  function onCancel() {
    void router.push('/academic/education-calendar/manage')
  }

  return {
    isEditMode,
    isLoadingEvent,
    isSaving,
    isDeleting,
    dateRangeOpen,
    dateRangeValue,
    dateRangeLabel,
    onSubmit,
    onDelete,
    onCancel,
    handleRangeUpdate,
  }
}
