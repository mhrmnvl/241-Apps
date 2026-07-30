<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { Button } from '@/ui/button'
import { Card, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import type { IncomeRange } from '@/features/academic/parent'
import type { StudentParentInput } from '../../types'

defineProps<{
  parents: StudentParentInput[]
  occupations: { id: string; name: string }[]
  relationOptions: { value: string; label: string }[]
  incomeOptions: { value: IncomeRange; label: string }[]
}>()

const emit = defineEmits<{
  (e: 'add-parent'): void
  (e: 'remove-parent', index: number): void
}>()
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-end -mt-3 mb-2">
      <Button
        size="sm"
        variant="outline"
        class="h-8 shadow-xs gap-1.5"
        @click="emit('add-parent')"
      >
        <Plus class="size-3.5" />
        Tambah Orang Tua
      </Button>
    </div>

    <div class="max-h-[48vh] overflow-y-auto space-y-4 pr-1">
      <p
        v-if="parents.length === 0"
        class="text-sm text-muted-foreground italic py-6 text-center border border-dashed rounded-xl bg-muted/5"
      >
        Belum ada data orang tua.
      </p>

      <template v-else>
        <Card
          v-for="(parent, index) in parents"
          :key="index"
          class="overflow-hidden rounded-xl border bg-card shadow-xs transition-all hover:border-primary/20"
        >
          <CardHeader
            class="flex flex-row items-center justify-between border-b px-5 py-3 bg-muted/20"
          >
            <CardTitle class="text-xs font-semibold">
              Orang Tua / Wali {{ index + 1 }}
            </CardTitle>
            <Button
              size="icon"
              variant="ghost"
              class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg transition-colors"
              @click="emit('remove-parent', index)"
            >
              <Trash2 class="size-4" />
            </Button>
          </CardHeader>
          <div class="p-5 grid gap-4 md:grid-cols-2 items-start">
            <div class="space-y-2">
              <label class="text-sm font-medium">Hubungan</label>
              <Select v-model="parent.relation">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih hubungan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="r in relationOptions"
                    :key="r.value"
                    :value="r.value"
                  >
                    {{ r.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Nama Lengkap</label>
              <Input
                v-model="parent.name"
                placeholder="Nama lengkap"
                maxlength="100"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">NIK</label>
              <Input
                v-model="parent.nik"
                placeholder="16 digit NIK"
                maxlength="16"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Tempat Lahir</label>
              <Input
                v-model="parent.birthPlace"
                placeholder="Kota lahir"
                maxlength="100"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Tanggal Lahir</label>
              <Input
                v-model="parent.birthDate"
                type="date"
              />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Pekerjaan</label>
              <Select v-model="parent.occupationId">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih pekerjaan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="occ in occupations"
                    :key="occ.id"
                    :value="occ.id"
                  >
                    {{ occ.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Penghasilan</label>
              <Select v-model="parent.income">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih penghasilan (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="opt in incomeOptions"
                    :key="opt.value"
                    :value="opt.value"
                  >
                    {{ opt.label }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">No. HP</label>
              <Input
                v-model="parent.phone"
                placeholder="08xxx (opsional)"
                maxlength="15"
              />
            </div>
          </div>
        </Card>
      </template>
    </div>
  </div>
</template>
