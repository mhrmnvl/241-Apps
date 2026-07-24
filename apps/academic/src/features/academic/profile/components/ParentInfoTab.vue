<script setup lang="ts">
import { Input } from '@/ui/input'
import type {
  ProfileParentsData,
  IncomeRange,
} from '@/features/platform/profile'

defineProps<{ data: ProfileParentsData }>()

const incomeLabels: Record<IncomeRange, string> = {
  BELOW_500K: '< Rp 500.000',
  BETWEEN_500K_1M: 'Rp 500.000 - 1.000.000',
  BETWEEN_1M_2M: 'Rp 1.000.000 - 2.000.000',
  BETWEEN_2M_3M: 'Rp 2.000.000 - 3.000.000',
  ABOVE_3M: '> Rp 3.000.000',
}

function formatIncome(val?: IncomeRange | null): string {
  return val ? (incomeLabels[val] ?? '-') : '-'
}

function getParentLabel(type?: string) {
  if (type === 'FATHER') return 'Data Ayah'
  if (type === 'MOTHER') return 'Data Ibu'
  if (type === 'GUARDIAN') return 'Data Wali'
  return 'Data Orang Tua'
}
</script>

<template>
  <div class="py-4">
    <div
      v-if="data.parents && data.parents.length > 0"
      class="space-y-8"
    >
      <div
        v-for="(parent, i) in data.parents"
        :key="i"
        class="space-y-2"
      >
        <h4 class="text-sm font-bold tracking-tight text-foreground">
          {{ getParentLabel(parent.type) }}
        </h4>
        <div class="grid gap-5 md:grid-cols-2">
          <!-- Nama Lengkap -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground"
              >Nama Lengkap</label
            >
            <Input
              :model-value="parent.name || '-'"
              disabled
              class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            />
          </div>

          <!-- NIK -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground">NIK</label>
            <Input
              :model-value="parent.nik || '-'"
              disabled
              class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            />
          </div>

          <!-- Tempat, Tanggal Lahir -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground"
              >Tempat, Tanggal Lahir</label
            >
            <Input
              :model-value="
                parent.birthPlace && parent.birthDate
                  ? `${parent.birthPlace}, ${parent.birthDate}`
                  : parent.birthPlace || parent.birthDate || '-'
              "
              disabled
              class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            />
          </div>

          <!-- No. Handphone -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground"
              >No. Handphone</label
            >
            <Input
              :model-value="parent.phone || '-'"
              disabled
              class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            />
          </div>

          <!-- Email Pribadi -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground"
              >Email Pribadi</label
            >
            <Input
              :model-value="parent.email || '-'"
              disabled
              class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            />
          </div>

          <!-- Pendidikan Terakhir -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground"
              >Pendidikan Terakhir</label
            >
            <Input
              :model-value="parent.education || '-'"
              disabled
              class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            />
          </div>

          <!-- Pekerjaan -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground"
              >Pekerjaan</label
            >
            <Input
              :model-value="parent.occupation || '-'"
              disabled
              class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            />
          </div>

          <!-- Penghasilan Bulanan -->
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground"
              >Penghasilan Bulanan</label
            >
            <Input
              :model-value="formatIncome(parent.income)"
              disabled
              class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            />
          </div>
        </div>
      </div>
    </div>
    <div
      v-else
      class="text-center p-8 bg-muted/20 border-2 border-dashed rounded-lg"
    >
      <p class="text-muted-foreground">
        Belum ada data orang tua yang ditambahkan.
      </p>
    </div>
  </div>
</template>
