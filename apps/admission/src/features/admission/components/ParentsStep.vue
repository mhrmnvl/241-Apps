<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { RELATION_LABELS } from '../types'
import type { ParentForm } from '../composables/useApplicationFormState'

defineProps<{
  editable: boolean
  onAdd: () => void
  onRemove: (index: number) => void
}>()

const parents = defineModel<ParentForm[]>({ required: true })
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="(parent, index) in parents"
      :key="index"
      class="rounded-md border p-4"
    >
      <div class="mb-3 flex items-center justify-between">
        <p class="font-medium">
          {{ RELATION_LABELS[parent.relation] }}
          <Badge
            v-if="parent.isPrimary"
            variant="secondary"
            class="ml-2"
          >
            Kontak Utama
          </Badge>
        </p>
        <Button
          v-if="editable && parents.length > 1"
          variant="ghost"
          size="sm"
          @click="onRemove(index)"
        >
          Hapus
        </Button>
      </div>
      <div class="grid gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label>Hubungan</Label>
          <Select
            v-model="parent.relation"
            :disabled="!editable"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FATHER">Ayah</SelectItem>
              <SelectItem value="MOTHER">Ibu</SelectItem>
              <SelectItem value="GUARDIAN">Wali</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <Label>Nama Lengkap</Label>
          <Input
            v-model="parent.name"
            :disabled="!editable"
          />
        </div>
        <div class="space-y-2">
          <Label>NIK</Label>
          <Input
            v-model="parent.nik"
            maxlength="16"
            :disabled="!editable"
          />
        </div>
        <div class="space-y-2">
          <Label>No. HP</Label>
          <Input
            v-model="parent.phone"
            :disabled="!editable"
          />
        </div>
        <div class="space-y-2">
          <Label>Tempat Lahir</Label>
          <Input
            v-model="parent.birthPlace"
            :disabled="!editable"
          />
        </div>
        <div class="space-y-2">
          <Label>Tanggal Lahir</Label>
          <Input
            v-model="parent.birthDate"
            type="date"
            :disabled="!editable"
          />
        </div>
      </div>
    </div>
    <Button
      v-if="editable"
      variant="outline"
      @click="onAdd"
    >
      + Tambah Orang Tua/Wali
    </Button>
  </div>
</template>
