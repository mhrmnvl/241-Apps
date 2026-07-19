<script setup lang="ts">
import type {
  EventData,
  EventCreatePayload,
  AudienceGroupOption,
} from '../types'
import { Button } from '@/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/form'
import { Input } from '@/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { RangeCalendar } from '@/ui/range-calendar'
import { ScrollArea } from '@/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/ui/sheet'
import { Textarea } from '@/ui/textarea'
import { useClassroomList } from '@/features/academic/classroom'
import { cn } from '@/shared/utils/utils'
import { toTypedSchema } from '@vee-validate/zod'
import { CalendarIcon } from 'lucide-vue-next'
import { parseDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { DateRange } from 'reka-ui'
import { useForm } from 'vee-validate'
import { computed, onMounted, ref, watch } from 'vue'
import * as z from 'zod'

const props = defineProps<{
  open?: boolean
  eventData?: EventData | null
  selectedDate?: string
  isSaving?: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  saved: [payload: EventCreatePayload, id?: string]
  deleted: [id: string]
}>()

const formSchema = toTypedSchema(
  z.object({
    title: z.string().min(1, 'Nama agenda harus diisi'),
    description: z.string().optional(),
    audienceGroupIds: z.array(z.string()).optional(),
    startTime: z.string().min(1, 'Tanggal mulai harus diisi'),
    endTime: z.string().min(1, 'Tanggal selesai harus diisi'),
    classroomId: z.string().optional(),
  }),
)

const { handleSubmit, resetForm, setValues, setFieldValue, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    title: '',
    description: '',
    audienceGroupIds: [] as string[],
    startTime: '',
    endTime: '',
    classroomId: 'ALL',
  },
})

const { classrooms, fetchClassrooms } = useClassroomList()

const audienceGroups = ref<AudienceGroupOption[]>([])

onMounted(async () => {
  await fetchClassrooms()
  try {
    const res = await import('@/shared/utils/api').then((m) =>
      m.default.get<{ data: AudienceGroupOption[] }>('/audience-groups', {
        params: { limit: 100 },
      }),
    )
    audienceGroups.value = res.data.data ?? []
  } catch {
    // non-blocking
  }
})

const dateRangeOpen = ref(false)

const dateRangeValue = computed<DateRange>({
  get() {
    const s = values.startTime ?? ''
    const e = values.endTime ?? ''
    return {
      start: s ? parseDate(s.split('T')[0]!) : undefined,
      end: e ? parseDate(e.split('T')[0]!) : undefined,
    }
  },
  set(val: DateRange) {
    setFieldValue('startTime', val.start ? val.start.toString() : '')
    setFieldValue('endTime', val.end ? val.end.toString() : '')
  },
})

function handleRangeUpdate(val: DateRange) {
  dateRangeValue.value = val
  if (val.start && val.end) dateRangeOpen.value = false
}

function formatDateLabel(dv: DateValue | undefined): string {
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
      if (props.eventData) {
        setValues({
          title: props.eventData.title,
          description: props.eventData.description ?? '',
          audienceGroupIds:
            props.eventData.audiences?.map((a) => a.audienceGroup.id) ?? [],
          startTime: props.eventData.startTime.slice(0, 10),
          endTime: props.eventData.endTime.slice(0, 10),
          classroomId: props.eventData.classroomIds?.[0] ?? 'ALL',
        })
      } else {
        const start = props.selectedDate ?? ''
        resetForm({
          values: {
            title: '',
            description: '',
            audienceGroupIds: [],
            startTime: start,
            endTime: start,
            classroomId: 'ALL',
          },
        })
      }
    }
  },
)

const onSubmit = handleSubmit((vals) => {
  const payload: EventCreatePayload = {
    title: vals.title,
    description: vals.description ?? '',
    audienceGroupIds: vals.audienceGroupIds ?? [],
    startTime: vals.startTime + 'T00:00:00',
    endTime: vals.endTime + 'T23:59:59',
    classroomIds:
      vals.classroomId && vals.classroomId !== 'ALL' ? [vals.classroomId] : [],
  }
  emit('saved', payload, props.eventData?.id)
})

const onOpenChange = (val: boolean) => {
  emit('update:open', val)
}

const isEditMode = computed(() => !!props.eventData)

const onDelete = () => {
  if (props.eventData?.id) {
    emit('deleted', props.eventData.id)
  }
}
</script>

<template>
  <Sheet
    :open="open"
    @update:open="onOpenChange"
  >
    <SheetContent class="w-full sm:max-w-md flex flex-col gap-0 border-l p-0">
      <SheetHeader class="px-6 py-6 border-b shrink-0 bg-muted/20">
        <SheetTitle>{{
          isEditMode ? 'Edit Agenda Kegiatan' : 'Tambah Agenda Kegiatan'
        }}</SheetTitle>
        <SheetDescription>
          {{
            isEditMode
              ? 'Ubah informasi agenda kegiatan di sini.'
              : 'Tambahkan agenda kegiatan baru.'
          }}
        </SheetDescription>
      </SheetHeader>

      <form
        class="flex-1 flex flex-col min-h-0"
        @submit="onSubmit"
      >
        <ScrollArea class="flex-1 min-h-0">
          <div class="flex flex-col gap-5 p-6">
            <FormField
              v-slot="{ componentField }"
              name="title"
            >
              <FormItem>
                <FormLabel>Nama Agenda</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    placeholder="Masukkan nama agenda..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ value, handleChange }"
              name="audienceGroupIds"
            >
              <FormItem>
                <FormLabel>Sasaran</FormLabel>
                <Select
                  :model-value="(value as string[])?.[0] ?? ''"
                  @update:model-value="(v) => handleChange(v ? [v] : [])"
                >
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Pilih Sasaran" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      v-for="ag in audienceGroups"
                      :key="ag.id"
                      :value="ag.id"
                    >
                      {{ ag.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="classroomId"
            >
              <FormItem>
                <FormLabel
                  >Kelas
                  <span class="text-muted-foreground font-normal"
                    >(Opsional)</span
                  ></FormLabel
                >
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue
                        placeholder="Pilih kelas (kosongkan untuk semua)"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Kelas</SelectItem>
                    <SelectItem
                      v-for="item in classrooms"
                      :key="item.id"
                      :value="item.id"
                    >
                      {{ item.displayName }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="startTime">
              <FormItem class="flex flex-col">
                <FormLabel>Rentang Tanggal</FormLabel>
                <Popover v-model:open="dateRangeOpen">
                  <PopoverTrigger as-child>
                    <FormControl>
                      <Button
                        variant="outline"
                        :class="
                          cn(
                            'w-full justify-start text-left font-normal',
                            !dateRangeLabel && 'text-muted-foreground',
                          )
                        "
                      >
                        <CalendarIcon class="mr-2 h-4 w-4 shrink-0" />
                        {{ dateRangeLabel || 'Pilih rentang tanggal' }}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    class="w-auto p-0"
                    align="start"
                  >
                    <RangeCalendar
                      :model-value="dateRangeValue"
                      locale="id-ID"
                      initial-focus
                      @update:model-value="handleRangeUpdate"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField name="endTime">
              <FormItem class="hidden">
                <FormMessage />
              </FormItem>
            </FormField>

            <FormField
              v-slot="{ componentField }"
              name="description"
            >
              <FormItem>
                <FormLabel
                  >Deskripsi
                  <span class="text-muted-foreground font-normal"
                    >(Opsional)</span
                  ></FormLabel
                >
                <FormControl>
                  <Textarea
                    v-bind="componentField"
                    placeholder="Masukkan deskripsi agenda..."
                    class="resize-none min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </ScrollArea>

        <SheetFooter
          class="px-6 py-4 border-t shrink-0 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 w-full bg-background"
        >
          <Button
            v-if="isEditMode"
            type="button"
            variant="destructive"
            :disabled="isSaving"
            class="sm:mr-auto"
            @click="onDelete"
          >
            Hapus
          </Button>
          <Button
            type="button"
            variant="outline"
            :disabled="isSaving"
            @click="onOpenChange(false)"
          >
            Batal
          </Button>
          <Button
            type="submit"
            :disabled="isSaving"
            class="flex-1 sm:flex-none"
          >
            {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
