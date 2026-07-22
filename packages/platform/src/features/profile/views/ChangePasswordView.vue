<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Button } from '@/ui/button'
import { ChevronLeft } from 'lucide-vue-next'
import ChangePasswordSection from '../components/ChangePasswordSection.vue'

const router = useRouter()

const breadcrumbs = [
  { title: 'Profil', href: '/profile' },
  { title: 'Ubah Password' },
]

function goBack() {
  void router.push({ name: 'profile-view' })
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="p-4 md:p-6 lg:p-8 w-full max-w-3xl">
      <Card
        class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
      >
        <CardHeader class="flex flex-row items-center gap-4 border-b px-6 py-5">
          <Button
            variant="outline"
            size="icon"
            @click="goBack"
          >
            <ChevronLeft class="h-4 w-4" />
          </Button>
          <div>
            <CardTitle class="text-2xl font-bold tracking-tight">
              Ubah Password
            </CardTitle>
            <p class="text-sm text-muted-foreground mt-1">
              Perbarui password akun Anda untuk menjaga keamanan.
            </p>
          </div>
        </CardHeader>
        <CardContent class="p-6">
          <ChangePasswordSection />
        </CardContent>
      </Card>
    </div>
  </AppLayout>
</template>
