<script setup lang="ts">
import { useLessonEditor } from '../composables/useLessonEditor'
import type { ScheduleTableRow } from '../types'
import { useBreadcrumbs } from '@/shared/composables/useBreadcrumbs'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Skeleton } from '@/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/ui/tooltip'
import { Badge } from '@/ui/badge'
import { formatEntityName } from '@/shared/utils/utils'
import { ArrowLeft, Plus, Save, Trash2, Lock } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const classroomId = computed(() => route.params.classroomId as string)

const {
  classroomInfo,
  allOrderedSlots,
  getAvailableLessonSlotsForDay,
  subjects,
  schedule,
  loading: isLoading,
  isSaving,
  fetchData,
  saveDay,
  DAYS,
  addRow,
  fillAllSlots,
  removeRow,
  isLessonSlot,
} = useLessonEditor(classroomId.value)

const activeDay = ref('MONDAY')

useBreadcrumbs(() => [
  { title: 'Pembelajaran', href: '#' },
  { title: 'Jadwal Pelajaran', href: '/learning/lesson' },
  {
    title: classroomInfo.value ? `Kelas ${classroomInfo.value.code}` : 'Kelas',
    href: '#',
  },
])

function formatTime(isoOrTime: string): string {
  if (!isoOrTime) return ''
  try {
    const d = new Date(isoOrTime)
    if (!isNaN(d.getTime())) {
      return d.toISOString().substring(11, 16)
    }
  } catch {
    return isoOrTime.substring(0, 5)
  }
  return isoOrTime.substring(0, 5)
}

function slotTypeLabel(type?: string): string {
  switch (type) {
    case 'BREAK':
      return 'Istirahat'
    case 'CEREMONY':
      return 'Upacara'
    case 'TAHFIDZ':
      return 'Tahfidz'
    default:
      return type ?? ''
  }
}

function slotTypeBadgeVariant(
  type?: string,
): 'secondary' | 'outline' | 'default' {
  switch (type) {
    case 'BREAK':
      return 'secondary'
    case 'CEREMONY':
      return 'outline'
    case 'TAHFIDZ':
      return 'default'
    default:
      return 'secondary'
  }
}

function buildTableRows(day: string): ScheduleTableRow[] {
  const lockedSlots = allOrderedSlots.value.filter((s) => !isLessonSlot(s))
  const lessonRows = schedule.value[day] ?? []

  const rows: ScheduleTableRow[] = []

  for (const slot of lockedSlots) {
    if (slot.type === 'CEREMONY' && day !== 'MONDAY') continue
    rows.push({ kind: 'locked', slot })
  }

  lessonRows.forEach((_, idx) => {
    rows.push({ kind: 'editable', rowIndex: idx })
  })

  function toMinutes(isoOrTime?: string): number {
    if (!isoOrTime) return 9999
    const d = new Date(isoOrTime)
    if (!isNaN(d.getTime())) return d.getUTCHours() * 60 + d.getUTCMinutes()
    const parts = isoOrTime.substring(0, 5).split(':').map(Number)
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0)
  }

  rows.sort((a, b) => {
    const startA =
      a.kind === 'locked'
        ? toMinutes(a.slot.startTime)
        : toMinutes(
            allOrderedSlots.value.find(
              (s) => s.id === lessonRows[a.rowIndex]?.timeSlotId,
            )?.startTime,
          )
    const startB =
      b.kind === 'locked'
        ? toMinutes(b.slot.startTime)
        : toMinutes(
            allOrderedSlots.value.find(
              (s) => s.id === lessonRows[b.rowIndex]?.timeSlotId,
            )?.startTime,
          )
    return startA - startB
  })

  return rows
}

function getLessonRowNumber(rowIndex: number): number {
  return rowIndex + 1
}

function canAddRow(day: string): boolean {
  const used = new Set((schedule.value[day] ?? []).map((r) => r.timeSlotId))
  return getAvailableLessonSlotsForDay(day).some((s) => !used.has(s.id))
}

onMounted(fetchData)
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader class="flex flex-row items-center gap-3 border-b px-6 py-5">
        <Button
          variant="ghost"
          size="icon"
          class="shrink-0"
          aria-label="Kembali"
          @click="router.push('/learning/lesson')"
        >
          <ArrowLeft class="size-4" />
        </Button>
        <div class="flex-1 flex flex-col gap-1">
          <CardTitle class="text-2xl font-bold tracking-tight">
            Jadwal Pelajaran
          </CardTitle>
          <div class="text-sm font-medium text-muted-foreground">
            <span v-if="classroomInfo">
              Kelas {{ formatEntityName(classroomInfo.code) }}
            </span>
            <Skeleton
              v-else
              class="h-5 w-32"
            />
          </div>
        </div>
      </CardHeader>

      <div
        v-if="isLoading"
        class="p-6 space-y-6"
      >
        <Skeleton class="h-10 w-full max-w-md rounded-lg" />
        <div class="rounded-md border bg-card p-4 space-y-4">
          <div class="flex gap-4 border-b pb-4">
            <Skeleton
              v-for="i in 4"
              :key="i"
              class="h-8 flex-1"
            />
          </div>
          <Skeleton
            v-for="i in 5"
            :key="i"
            class="h-12 w-full"
          />
        </div>
      </div>

      <div
        v-else
        class="px-6 mt-3"
      >
        <Tabs v-model="activeDay">
          <TabsList class="mb-6 w-full grid grid-cols-6">
            <TabsTrigger
              v-for="day in DAYS"
              :key="day.value"
              :value="day.value"
            >
              {{ day.label }}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            v-for="day in DAYS"
            :key="day.value"
            :value="day.value"
            class="mt-0 outline-none"
          >
            <div class="rounded-md border bg-card">
              <Table>
                <TableHeader>
                  <TableRow class="bg-muted/50 hover:bg-muted/50">
                    <TableHead
                      class="w-[50px] text-center px-4 font-semibold text-foreground"
                    >
                      No.
                    </TableHead>
                    <TableHead
                      class="text-center px-4 font-semibold text-foreground"
                    >
                      Jam Pelajaran
                    </TableHead>
                    <TableHead
                      class="text-center px-4 font-semibold text-foreground"
                    >
                      Mata Pelajaran
                    </TableHead>
                    <TableHead class="w-[70px] px-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <template
                    v-for="(item, displayIdx) in buildTableRows(day.value)"
                    :key="displayIdx"
                  >
                    <!-- ── Locked Row (BREAK / CEREMONY / TAHFIDZ) ── -->
                    <TableRow
                      v-if="item.kind === 'locked'"
                      class="bg-muted/30 hover:bg-muted/30 text-muted-foreground"
                    >
                      <TableCell class="text-center py-3 text-[13px]">
                        <Lock class="size-3 mx-auto text-muted-foreground/50" />
                      </TableCell>

                      <TableCell class="py-3 px-4 text-[13px]">
                        <span class="font-medium">
                          {{ formatEntityName(item.slot.name ?? '') }}
                        </span>
                        <span class="ml-2 text-muted-foreground/70">
                          ({{ formatTime(item.slot.startTime ?? '') }}–{{
                            formatTime(item.slot.endTime ?? '')
                          }})
                        </span>
                      </TableCell>

                      <TableCell class="py-3 px-4">
                        <Badge
                          :variant="slotTypeBadgeVariant(item.slot.type)"
                          class="text-[11px]"
                        >
                          {{ slotTypeLabel(item.slot.type) }}
                        </Badge>
                      </TableCell>

                      <TableCell class="py-3 px-4" />
                    </TableRow>

                    <!-- ── Editable Row (LESSON) ── -->
                    <TableRow
                      v-else-if="
                        item.kind === 'editable' && schedule[day.value]
                      "
                    >
                      <TableCell
                        class="text-center font-medium text-muted-foreground py-3 text-[13px]"
                      >
                        {{ getLessonRowNumber(item.rowIndex) }}
                      </TableCell>

                      <TableCell class="py-3 px-2">
                        <Select
                          v-model="
                            schedule[day.value]![item.rowIndex]!.timeSlotId
                          "
                        >
                          <SelectTrigger
                            class="w-full bg-background text-[13px] h-9"
                            aria-label="Pilih Jam Pelajaran"
                          >
                            <SelectValue placeholder="Pilih Jam Pelajaran..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="ts in getAvailableLessonSlotsForDay(
                                day.value,
                              )"
                              :key="ts.id"
                              :value="ts.id"
                            >
                              {{ formatEntityName(ts.name ?? '') }} ({{
                                formatTime(ts.startTime ?? '')
                              }}–{{ formatTime(ts.endTime ?? '') }})
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell class="py-3 px-2">
                        <Select
                          v-model="
                            schedule[day.value]![item.rowIndex]!.subjectId
                          "
                        >
                          <SelectTrigger
                            class="w-full bg-background text-[13px] h-9"
                            aria-label="Pilih Mata Pelajaran"
                          >
                            <SelectValue
                              placeholder="Pilih Mata Pelajaran..."
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              v-for="sbj in subjects"
                              :key="sbj.id"
                              :value="sbj.id"
                            >
                              {{ formatEntityName(sbj.name) }}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell class="text-right pr-4 py-3">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger as-child>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Hapus baris"
                                class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                @click="removeRow(day.value, item.rowIndex)"
                              >
                                <Trash2 class="size-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Hapus baris</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  </template>

                  <!-- Empty state: hanya muncul jika tidak ada editable rows -->
                  <TableRow
                    v-if="schedule && (schedule[day.value]?.length ?? 0) === 0"
                  >
                    <TableCell
                      colspan="4"
                      class="h-20 text-center text-muted-foreground text-[13px]"
                    >
                      Belum ada jadwal pelajaran untuk hari {{ day.label }}.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div
              class="flex flex-wrap items-center justify-between pt-4 gap-3 pb-6"
            >
              <div class="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  class="w-full sm:w-auto"
                  :disabled="!canAddRow(day.value)"
                  @click="addRow(day.value)"
                >
                  <Plus class="size-4 mr-1.5" />
                  Tambah Baris
                </Button>
                <Button
                  v-if="schedule && schedule[day.value]?.length === 0"
                  variant="outline"
                  size="sm"
                  class="w-full sm:w-auto"
                  @click="fillAllSlots(day.value)"
                >
                  Isi Semua Jam
                </Button>
              </div>

              <Button
                size="sm"
                :disabled="isSaving ? isSaving[day.value] : false"
                class="w-full sm:w-auto shrink-0"
                @click="saveDay(day.value)"
              >
                <div
                  v-if="isSaving && isSaving[day.value]"
                  class="size-4 mr-1.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"
                />
                <Save
                  v-else
                  class="size-4 mr-1.5"
                />
                {{
                  isSaving && isSaving[day.value]
                    ? 'Menyimpan...'
                    : `Simpan Perubahan`
                }}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  </div>
</template>
