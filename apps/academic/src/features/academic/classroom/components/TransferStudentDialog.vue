<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ClassroomEnrollment, Classroom } from '../types'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Badge } from '@/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover'
import { cn, formatEntityName } from '@/shared/utils/utils'
import { Check, ChevronsUpDown, ArrowRightLeft } from 'lucide-vue-next'

const props = defineProps<{
  enrollments: ClassroomEnrollment[]
  currentClassroomId: string
  classrooms: Classroom[]
  loading: boolean
}>()

const emit = defineEmits<{
  transfer: [targetClassroomId: string, note?: string]
}>()

const open = defineModel<boolean>('open', { default: false })

const targetClassroomId = ref('')
const note = ref('')
const classroomPopoverOpen = ref(false)

const availableClassrooms = computed(() =>
  props.classrooms.filter(
    (c) => c.id !== props.currentClassroomId && c.isActive,
  ),
)

const selectedClassroom = computed(() =>
  availableClassrooms.value.find((c) => c.id === targetClassroomId.value),
)

const selectedClassroomLabel = computed(() => {
  if (!targetClassroomId.value) return 'Pilih kelas tujuan...'
  return selectedClassroom.value
    ? selectedClassroom.value.displayName
    : 'Kelas tidak ditemukan'
})

const canTransfer = computed(
  () =>
    targetClassroomId.value && props.enrollments.length > 0 && !props.loading,
)

function handleTransfer() {
  if (!canTransfer.value) return
  emit('transfer', targetClassroomId.value, note.value || undefined)
}

function handleOpenChange(val: boolean) {
  if (!val) {
    targetClassroomId.value = ''
    note.value = ''
  }
  open.value = val
}
</script>

<template>
  <Dialog
    :open="open"
    @update:open="handleOpenChange"
  >
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <ArrowRightLeft class="h-5 w-5" />
          Pindah Kelas
        </DialogTitle>
        <DialogDescription>
          Pindahkan {{ enrollments.length }} siswa ke kelas lain.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-2">
        <div class="space-y-2">
          <Label class="text-sm font-medium">Siswa yang dipindahkan</Label>
          <div
            class="rounded-lg border bg-muted/30 p-3 max-h-[140px] overflow-y-auto space-y-1"
          >
            <div
              v-for="enrollment in enrollments"
              :key="enrollment.id"
              class="flex items-center justify-between text-sm"
            >
              <span>{{
                formatEntityName(enrollment.student.user.profile.name)
              }}</span>
              <Badge
                variant="outline"
                class="text-xs"
              >
                {{ enrollment.student.nis }}
              </Badge>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">
            Kelas Tujuan <span class="text-destructive">*</span>
          </Label>
          <Popover v-model:open="classroomPopoverOpen">
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                role="combobox"
                :aria-expanded="classroomPopoverOpen"
                :disabled="loading"
                :class="
                  cn(
                    'w-full justify-between',
                    !targetClassroomId && 'text-muted-foreground',
                  )
                "
              >
                {{ selectedClassroomLabel }}
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              class="w-(--reka-popover-trigger-width) p-0"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder="Cari kelas..."
                  class="h-9 text-sm"
                />
                <CommandEmpty>Kelas tidak ditemukan.</CommandEmpty>
                <CommandList class="max-h-[200px]">
                  <CommandGroup>
                    <CommandItem
                      v-for="classroom in availableClassrooms"
                      :key="classroom.id"
                      :value="`${classroom.displayName} ${classroom.code} ${classroom.id}`"
                      @select="
                        () => {
                          targetClassroomId = classroom.id
                          classroomPopoverOpen = false
                        }
                      "
                    >
                      <Check
                        :class="
                          cn(
                            'mr-2 h-4 w-4 shrink-0',
                            targetClassroomId === classroom.id
                              ? 'opacity-100'
                              : 'opacity-0',
                          )
                        "
                      />
                      <div class="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          class="text-xs"
                        >
                          {{ classroom.classroomLevel?.name ?? '-' }}
                        </Badge>
                        <span>{{ classroom.displayName }}</span>
                      </div>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div class="space-y-2">
          <Label class="text-sm font-medium">Catatan (opsional)</Label>
          <Input
            v-model="note"
            placeholder="Alasan pindah kelas..."
            :disabled="loading"
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          :disabled="loading"
          @click="handleOpenChange(false)"
        >
          Batal
        </Button>
        <Button
          :disabled="!canTransfer"
          @click="handleTransfer"
        >
          <ArrowRightLeft
            v-if="!loading"
            class="h-4 w-4 mr-2"
          />
          {{ loading ? 'Memindahkan...' : 'Pindahkan' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
