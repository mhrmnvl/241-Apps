<script setup lang="ts">
import { DataTable, DatePicker } from '@/ui'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Textarea } from '@/ui/textarea'
import { Plus } from 'lucide-vue-next'
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { createMyLeaveColumns } from '../components/myLeaveColumns'
import {
  balances,
  leaveService,
  loading,
  myRequests,
  types,
} from '../services/leaveService'

const open = ref(false)
const leaveTypeId = ref('')
const startDate = ref('')
const endDate = ref('')
const reason = ref('')

const tableColumns = createMyLeaveColumns((id: string) => {
  void leaveService.withdraw(id)
})

const employeeTypes = computed(() =>
  types.value.filter((t) => t.appliesTo === 'EMPLOYEE'),
)

const selectedType = computed(() =>
  types.value.find((t) => t.id === leaveTypeId.value),
)

async function submit() {
  if (
    !leaveTypeId.value ||
    !startDate.value ||
    !endDate.value ||
    !reason.value
  ) {
    toast.error('Lengkapi semua isian.')
    return
  }
  const submitted = await leaveService.submit({
    leaveTypeId: leaveTypeId.value,
    startDate: startDate.value,
    endDate: endDate.value,
    reason: reason.value,
  })
  if (submitted) {
    open.value = false
    leaveTypeId.value = ''
    startDate.value = ''
    endDate.value = ''
    reason.value = ''
  }
}

onMounted(() => {
  void leaveService.fetchTypes()
  void leaveService.fetchMine()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <CardHeader
        class="flex flex-row items-center justify-between border-b px-6 py-5"
      >
        <CardTitle class="text-2xl font-bold tracking-tight">
          Izin & Cuti Saya
        </CardTitle>
        <Button @click="open = true">
          <Plus class="mr-2 h-4 w-4" />
          Ajukan
        </Button>
      </CardHeader>

      <div class="p-6 space-y-6">
        <div
          v-if="balances.length > 0"
          class="grid gap-4 sm:grid-cols-3"
        >
          <div
            v-for="balance in balances"
            :key="balance.leaveTypeId"
            class="flex flex-col justify-between rounded-xl border bg-card p-4 shadow-sm space-y-3"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-foreground font-semibold text-sm">
                {{ balance.name }}
              </span>
              <span
                class="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground shrink-0"
              >
                Tahun {{ balance.year }}
              </span>
            </div>

            <div>
              <p class="text-2xl font-bold tracking-tight text-foreground">
                {{ balance.remaining }}
                <span class="text-xs font-normal text-muted-foreground">
                  sisa hari
                </span>
              </p>
            </div>

            <div
              class="flex items-center justify-between border-t pt-2.5 text-xs text-muted-foreground"
            >
              <span>
                Total Kuota:
                <strong class="font-semibold text-foreground">
                  {{ balance.quota }} hari
                </strong>
              </span>
              <span>
                Terpakai:
                <strong class="font-semibold text-foreground">
                  {{ balance.used }} hari
                </strong>
              </span>
            </div>
          </div>
        </div>

        <DataTable
          :columns="tableColumns"
          :data="myRequests"
          :is-loading="loading"
          item-label="pengajuan izin/cuti"
        />

        <Dialog v-model:open="open">
          <DialogContent
            class="sm:max-w-lg flex flex-col gap-0 p-0 overflow-hidden"
          >
            <DialogHeader class="px-6 py-5 border-b shrink-0 bg-muted/20">
              <DialogTitle>Ajukan Izin / Cuti</DialogTitle>
              <DialogDescription class="sr-only" />
            </DialogHeader>

            <div class="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div class="space-y-1">
                <Label for="leave-type">
                  Jenis <span class="text-red-500">*</span>
                </Label>
                <Select v-model="leaveTypeId">
                  <SelectTrigger
                    id="leave-type"
                    class="w-full"
                  >
                    <SelectValue placeholder="Pilih jenis izin / cuti…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem
                      v-for="type in employeeTypes"
                      :key="type.id"
                      :value="type.id"
                    >
                      {{ type.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p
                  v-if="selectedType?.requiresDocument"
                  class="pt-1 text-xs font-medium text-amber-600"
                >
                  Jenis ini memerlukan surat pendukung.
                </p>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <Label>Mulai <span class="text-red-500">*</span></Label>
                  <DatePicker v-model="startDate" />
                </div>
                <div class="space-y-1">
                  <Label>Sampai <span class="text-red-500">*</span></Label>
                  <DatePicker v-model="endDate" />
                </div>
              </div>

              <div class="space-y-1">
                <Label for="leave-reason">
                  Alasan <span class="text-red-500">*</span>
                </Label>
                <Textarea
                  id="leave-reason"
                  v-model="reason"
                  placeholder="Tuliskan alasan pengajuan..."
                  rows="3"
                />
              </div>
            </div>

            <DialogFooter class="px-6 py-4 border-t bg-muted/20">
              <Button
                variant="outline"
                @click="open = false"
              >
                Batal
              </Button>
              <Button @click="submit">Kirim</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  </div>
</template>
