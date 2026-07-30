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
import type { PositionListItem, TeacherPositionInput } from '../../types'

defineProps<{
  extraPositions: TeacherPositionInput[]
  positions: PositionListItem[]
}>()

const emit = defineEmits<{
  (e: 'add-position'): void
  (e: 'remove-position', index: number): void
}>()
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-end -mt-3 mb-2">
      <Button
        size="sm"
        variant="outline"
        class="h-8 shadow-xs gap-1.5"
        @click="emit('add-position')"
      >
        <Plus class="size-3.5" />
        Tambah Jabatan
      </Button>
    </div>

    <div class="max-h-[48vh] overflow-y-auto space-y-4 pr-1">
      <p
        v-if="extraPositions.length === 0"
        class="text-sm text-muted-foreground italic py-6 text-center border border-dashed rounded-xl bg-muted/5"
      >
        Belum ada jabatan tambahan.
      </p>

      <template v-else>
        <Card
          v-for="(pos, index) in extraPositions"
          :key="index"
          class="overflow-hidden rounded-xl border bg-card shadow-xs transition-all hover:border-primary/20"
        >
          <CardHeader
            class="flex flex-row items-center justify-between border-b px-5 py-3 bg-muted/20"
          >
            <CardTitle class="text-xs font-semibold">
              Jabatan {{ index + 1 }}
            </CardTitle>
            <Button
              size="icon"
              variant="ghost"
              class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 w-7 rounded-lg transition-colors"
              @click="emit('remove-position', index)"
            >
              <Trash2 class="size-4" />
            </Button>
          </CardHeader>
          <div class="p-5 grid gap-4 md:grid-cols-2 items-start">
            <div class="space-y-2">
              <label class="text-sm font-medium">Jabatan</label>
              <Select v-model="pos.positionId">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih jabatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    v-for="p in positions"
                    :key="p.id"
                    :value="p.id"
                  >
                    {{ p.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Tanggal Mulai</label>
              <Input
                v-model="pos.hireDate"
                type="date"
              />
            </div>
          </div>
        </Card>
      </template>
    </div>
  </div>
</template>
