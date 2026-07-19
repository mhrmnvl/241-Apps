<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import { Package } from 'lucide-vue-next'

const route = useRoute()

const title = computed(() => route.meta.title ?? 'Halaman Modul')
const description = computed(
  () =>
    (route.meta.description as string) ??
    'Modul Manajemen Aset dan Inventaris.',
)
const breadcrumbs = computed(() => [
  { title: 'Inventaris', href: '#' },
  { title: title.value },
])
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader
          class="flex flex-row items-center justify-between border-b px-6 py-5"
        >
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              {{ title }}
            </CardTitle>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ description }}
            </p>
          </div>
        </CardHeader>

        <CardContent
          class="p-6 flex flex-col items-center justify-center min-h-[350px] text-center"
        >
          <div
            class="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-4 ring-8 ring-amber-50/50"
          >
            <Package class="size-8" />
          </div>
          <h3 class="text-lg font-semibold text-foreground mb-1">
            Halaman Sedang Dikembangkan
          </h3>
          <p class="text-sm text-muted-foreground max-w-sm">
            Halaman untuk modul
            <strong class="text-foreground">{{ title }}</strong> saat ini sedang
            dalam proses pengembangan sistem SIMAS 241.
          </p>
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
