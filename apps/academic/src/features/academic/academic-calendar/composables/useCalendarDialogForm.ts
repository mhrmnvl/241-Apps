import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import * as z from 'zod'
import { parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { DateRange } from 'reka-ui'
import type { CalendarEventData, CalendarSavePayload } from '../types'
import { useAcademicYearList } from '@/features/academic/academic-year'
import type { AcademicYear } from '@/features/academic/academic-year'

const calendarFormSchema = toTypedSchema(
  z
    .object({
      title: z.string().min(1, 'Nama agenda harus diisi'),
      description: z.string().optional(),
      typeId: z.string().min(1, 'Kategori harus dipilih'),
      startDate: z.string().min(1, 'Tanggal mulai harus diisi'),
      endDate: z.string().min(1, 'Tanggal selesai harus diisi'),
      // Optional, and both or neither. Most entries are measured in days — a
      // term, a holiday — and only an activity names hours. Caught here as well
      // as on the server so the person is told at the field rather than after
      // pressing save.
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      academicYearId: z.string().optional(),
    })
    .refine((v) => !!v.startTime === !!v.endTime, {
      message: 'Isi jam mulai dan jam selesai, atau kosongkan keduanya',
      path: ['endTime'],
    })
    .refine((v) => !v.startTime || !v.endTime || v.endTime > v.startTime, {
      message: 'Jam selesai harus setelah jam mulai',
      path: ['endTime'],
    }),
)

export function useCalendarDialogForm(props: {
  open?: boolean
  eventData?: CalendarEventData | null
  selectedDate?: string
  emit: {
    (e: 'update:open', value: boolean): void
    (e: 'saved', payload: CalendarSavePayload, id?: string): void
    (e: 'deleted', id: string): void
  }
}) {
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

  onMounted(async () => {
    await fetchAcademicYears()
  })

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
        start: s ? parseDate(s.split('T')[0]) : undefined,
        end: e ? parseDate(e.split('T')[0]) : undefined,
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

  watch(
    () => props.open,
    (isOpen) => {
      if (isOpen) {
        const activeYearId = activeAcademicYear.value?.id ?? ''

        if (props.eventData) {
          setValues({
            title: props.eventData.title,
            description: props.eventData.description ?? '',
            typeId: props.eventData.typeId,
            startDate: props.eventData.startDate.slice(0, 10),
            endDate: props.eventData.endDate.slice(0, 10),
            // The server sends time-of-day; the input wants HH:mm.
            startTime: props.eventData.startTime?.slice(11, 16) ?? '',
            endTime: props.eventData.endTime?.slice(11, 16) ?? '',
            academicYearId: props.eventData.academicYearId ?? activeYearId,
          })
        } else {
          const start = props.selectedDate ?? ''
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
      }
    },
  )

  watch(activeAcademicYear, (ay) => {
    if (ay && !values.academicYearId) {
      setFieldValue('academicYearId', ay.id)
    }
  })

  const onSubmit = handleSubmit((vals) => {
    const payload: Partial<CalendarSavePayload> = {
      title: vals.title,
      typeId: vals.typeId,
      startDate: vals.startDate + 'T00:00:00',
      endDate: vals.endDate + 'T23:59:59',
    }

    if (vals.description) {
      payload.description = vals.description
    }

    // Always sent, even when cleared: an edit that empties the hours has to
    // reach the server as empty, or the activity keeps times the form no
    // longer shows.
    //
    // `||` rather than `??`, and the lint config allows it on strings for this
    // reason: a cleared input is `''`, not null, so `??` would keep it and post
    // an empty string into a field validated as HH:mm.
    payload.startTime = vals.startTime || undefined
    payload.endTime = vals.endTime || undefined

    payload.academicYearId = vals.academicYearId ?? activeAcademicYear.value?.id

    props.emit('saved', payload as CalendarSavePayload, props.eventData?.id)
  })

  const isEditMode = computed(() => !!props.eventData)

  const onDelete = () => {
    if (props.eventData?.id) {
      props.emit('deleted', props.eventData.id)
    }
  }

  const onOpenChange = (val: boolean) => {
    props.emit('update:open', val)
  }

  return {
    dateRangeOpen,
    dateRangeValue,
    dateRangeLabel,
    isEditMode,
    onSubmit,
    onDelete,
    onOpenChange,
    handleRangeUpdate,
  }
}
