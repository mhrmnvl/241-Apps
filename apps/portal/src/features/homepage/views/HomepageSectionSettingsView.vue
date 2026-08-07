<script setup lang="ts">
import { onMounted } from 'vue'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Switch } from '@/ui/switch'
import { homepageService } from '../services/homepageService'
import { useHomepageStore } from '../stores/homepageStore'
import { SECTION_TITLES } from '../types'

const store = useHomepageStore()

onMounted(() => {
  void homepageService.fetchSettings()
})

function save(key: string, itemCount: number, isEnabled: boolean) {
  void homepageService.updateSection(key, { itemCount, isEnabled })
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <Card
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 w-full"
    >
      <CardHeader
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
      >
        <div>
          <CardTitle class="text-2xl font-bold tracking-tight"
            >Beranda</CardTitle
          >
        </div>
      </CardHeader>

      <CardContent class="p-6 space-y-4">
        <p
          v-if="store.loading"
          class="text-sm text-muted-foreground"
        >
          Memuat…
        </p>

        <div
          v-for="section in store.settings"
          v-else
          :key="section.key"
          class="flex flex-wrap items-end gap-4 rounded-md border p-4"
        >
          <div class="flex-1">
            <p class="font-medium">
              {{ SECTION_TITLES[section.key] ?? section.key }}
            </p>
            <p class="text-xs text-muted-foreground">
              Urutan {{ section.displayOrder }}
            </p>
          </div>

          <div class="space-y-1.5">
            <Label :for="`count-${section.key}`">Jumlah item</Label>
            <Input
              :id="`count-${section.key}`"
              v-model.number="section.itemCount"
              type="number"
              min="1"
              max="12"
              class="w-24"
            />
          </div>

          <div class="space-y-1.5">
            <Label :for="`enabled-${section.key}`">Tampilkan</Label>
            <div class="h-9 pt-1.5">
              <Switch
                :id="`enabled-${section.key}`"
                v-model="section.isEnabled"
              />
            </div>
          </div>

          <Button
            :disabled="store.isSaving"
            @click="save(section.key, section.itemCount, section.isEnabled)"
          >
            Simpan
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
