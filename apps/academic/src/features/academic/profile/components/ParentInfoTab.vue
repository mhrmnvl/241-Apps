<script setup lang="ts">
import {
  User,
  Fingerprint,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  Briefcase,
  Wallet,
} from 'lucide-vue-next'
import { Card, CardContent } from '@/ui/card'
import type {
  ProfileParentsData,
  IncomeRange,
} from '@/features/platform/profile'

defineProps<{ data: ProfileParentsData }>()

function getParentLabel(type?: string) {
  if (type === 'FATHER') return 'Data Ayah'
  if (type === 'MOTHER') return 'Data Ibu'
  if (type === 'GUARDIAN') return 'Data Wali'
  return 'Data Orang Tua'
}

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
</script>

<template>
  <div class="py-4">
    <div
      v-if="data.parents && data.parents.length > 0"
      class="flex flex-col gap-6"
    >
      <Card
        v-for="(parent, i) in data.parents"
        :key="i"
        class="flex flex-col shadow-sm overflow-hidden transition-all duration-200 w-full"
      >
        <div class="border-b px-5 py-4 bg-muted/20">
          <h3 class="font-bold text-xl text-foreground leading-none truncate">
            {{ getParentLabel(parent.type) }}
          </h3>
        </div>
        <CardContent class="p-4 bg-muted/5 flex-1">
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-lg border bg-background p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <p class="text-xs font-medium text-muted-foreground">
                  Nama Lengkap
                </p>
                <User class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </div>
              <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
                {{ parent.name || '-' }}
              </p>
            </div>
            <div class="rounded-lg border bg-background p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <p class="text-xs font-medium text-muted-foreground">NIK</p>
                <Fingerprint
                  class="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
              </div>
              <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
                {{ parent.nik || '-' }}
              </p>
            </div>
            <div class="rounded-lg border bg-background p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <p class="text-xs font-medium text-muted-foreground">
                  Tempat, Tanggal Lahir
                </p>
                <Calendar
                  class="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
              </div>
              <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
                {{ parent.birthPlace || '-' }}, {{ parent.birthDate || '-' }}
              </p>
            </div>
            <div class="rounded-lg border bg-background p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <p class="text-xs font-medium text-muted-foreground">
                  No. Handphone
                </p>
                <Phone class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </div>
              <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
                {{ parent.phone || '-' }}
              </p>
            </div>
            <div class="rounded-lg border bg-background p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <p class="text-xs font-medium text-muted-foreground">
                  Email Pribadi
                </p>
                <Mail class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </div>
              <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
                {{ parent.email || '-' }}
              </p>
            </div>
            <div class="rounded-lg border bg-background p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <p class="text-xs font-medium text-muted-foreground">
                  Pendidikan Terakhir
                </p>
                <GraduationCap
                  class="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
              </div>
              <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
                {{ parent.education || '-' }}
              </p>
            </div>
            <div class="rounded-lg border bg-background p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <p class="text-xs font-medium text-muted-foreground">
                  Pekerjaan
                </p>
                <Briefcase
                  class="mt-0.5 size-4 shrink-0 text-muted-foreground"
                />
              </div>
              <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
                {{ parent.occupation || '-' }}
              </p>
            </div>
            <div class="rounded-lg border bg-background p-4 shadow-sm">
              <div class="flex items-start justify-between gap-3">
                <p class="text-xs font-medium text-muted-foreground">
                  Penghasilan Bulanan
                </p>
                <Wallet class="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              </div>
              <p class="mt-2 text-sm leading-6 font-semibold text-foreground">
                {{ formatIncome(parent.income) }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
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
