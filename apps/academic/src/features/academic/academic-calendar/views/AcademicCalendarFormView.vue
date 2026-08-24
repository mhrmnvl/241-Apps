<script setup lang="ts">
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { PAGINATION } from '@/shared/constants/pagination'
import { ref, onMounted } from 'vue'
import { useCalendarFormPage } from '../composables/useCalendarFormPage'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/ui/alert-dialog'
import { Textarea } from '@/ui/textarea'
import { cn } from '@/shared/utils/utils'
import { CalendarIcon, ArrowLeft } from 'lucide-vue-next'
import { academicCalendarTypeApi } from '@/features/academic/academic-calendar-type/api/academicCalendarTypeApi'

const {
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
} = useCalendarFormPage()

const calendarTypes = ref<{ id: string; name: string }[]>([])

onMounted(async () => {
  try {
    const res = await academicCalendarTypeApi.getAcademicCalendarTypes({
      limit: PAGINATION.REFERENCE_LIMIT,
      isActive: true,
    })
    calendarTypes.value = res.data?.data ?? []
  } catch (error: unknown) {
    toast.error(
      getIndonesianErrorMessage(error, 'Gagal memuat tipe kalender akademik.'),
    )
  }
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 flex flex-col gap-0"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 shrink-0 gap-4"
      >
        <div class="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            class="h-8 w-8 shrink-0"
            @click="onCancel"
          >
            <ArrowLeft class="h-4 w-4" />
          </Button>
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              {{
                isEditMode ? 'Edit Agenda Kalender' : 'Tambah Agenda Kalender'
              }}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <!-- Loading State when fetching event detail -->
      <div
        v-if="isLoadingEvent"
        class="p-6 flex flex-col items-center justify-center py-20 space-y-4"
      >
        <span class="text-sm text-muted-foreground animate-pulse"
          >Memuat data detail agenda...</span
        >
      </div>

      <form
        v-else
        class="flex flex-col"
        @submit="onSubmit"
      >
        <div class="p-6 md:p-8 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nama Agenda (Full Width) -->
            <FormField
              v-slot="{ componentField }"
              name="title"
            >
              <FormItem class="md:col-span-2">
                <FormLabel>Nama Agenda</FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    placeholder="Contoh: Ujian Akhir Semester Ganjil"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Kategori Agenda -->
            <FormField
              v-slot="{ componentField }"
              name="typeId"
            >
              <FormItem>
                <FormLabel>Kategori Agenda</FormLabel>
                <Select v-bind="componentField">
                  <FormControl>
                    <SelectTrigger class="w-full">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      v-for="ct in calendarTypes"
                      :key="ct.id"
                      :value="ct.id"
                    >
                      {{ ct.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Rentang Tanggal -->
            <FormField name="startDate">
              <FormItem class="flex flex-col justify-end">
                <FormLabel>Rentang Tanggal</FormLabel>
                <Popover v-model:open="dateRangeOpen">
                  <PopoverTrigger as-child>
                    <FormControl>
                      <Button
                        variant="outline"
                        :class="
                          cn(
                            'w-full justify-start text-left font-normal h-10',
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

            <!-- Hidden End Date field for form validation tracking -->
            <FormField name="endDate">
              <FormItem class="hidden">
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Jam Mulai -->
            <FormField
              v-slot="{ componentField }"
              name="startTime"
            >
              <FormItem>
                <FormLabel>
                  Jam Mulai
                  <span class="text-muted-foreground font-normal text-xs"
                    >(Opsional)</span
                  >
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="time"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Jam Selesai -->
            <FormField
              v-slot="{ componentField }"
              name="endTime"
            >
              <FormItem>
                <FormLabel>
                  Jam Selesai
                  <span class="text-muted-foreground font-normal text-xs"
                    >(Opsional)</span
                  >
                </FormLabel>
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="time"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>

            <!-- Deskripsi (Full Width) -->
            <FormField
              v-slot="{ componentField }"
              name="description"
            >
              <FormItem class="md:col-span-2">
                <FormLabel>
                  Deskripsi / Keterangan
                  <span class="text-muted-foreground font-normal text-xs"
                    >(Opsional)</span
                  >
                </FormLabel>
                <FormControl>
                  <Textarea
                    v-bind="componentField"
                    placeholder="Tambahkan catatan atau rincian agenda..."
                    class="resize-none min-h-[120px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </div>

        <!-- Action Footer -->
        <div
          class="flex items-center justify-between border-t px-6 py-4 bg-background"
        >
          <Button
            type="button"
            variant="outline"
            :disabled="isSaving || isDeleting"
            @click="onCancel"
          >
            Batal
          </Button>
          <div class="flex items-center gap-2">
            <AlertDialog v-if="isEditMode">
              <AlertDialogTrigger as-child>
                <Button
                  type="button"
                  variant="destructive"
                  :disabled="isSaving || isDeleting"
                >
                  {{ isDeleting ? 'Menghapus...' : 'Hapus' }}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Agenda kalender ini
                    akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    @click="onDelete"
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              type="submit"
              :disabled="isSaving || isDeleting"
            >
              {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  </div>
</template>
