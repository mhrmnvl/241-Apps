<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTenant } from '../composables/useTenant'
import type { TenantProfile, TenantStatus } from '../types/tenant.types'
import { Card, CardHeader, CardTitle, CardContent } from '@/ui/card'
import { Button } from '@/ui/button'
import { Badge } from '@/ui/badge'
import { Plus, Pencil, Trash2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/ui/sheet'

const {
  tenants,
  isLoading,
  isSaving,
  error,
  fetchTenants,
  createTenant,
  updateTenant,
  deleteTenant,
} = useTenant()

const isSheetOpen = ref(false)
const isEditing = ref(false)
const selectedTenantId = ref<string | null>(null)

// Form fields
const form = ref<{
  name: string
  slug: string
  planId: string
  status: TenantStatus
  logoUrl: string
  primaryColor: string
}>({
  name: '',
  slug: '',
  planId: '',
  status: 'TRIAL',
  logoUrl: '',
  primaryColor: '#3b82f6',
})

onMounted(async () => {
  await fetchTenants()
})

const handleAddClick = () => {
  isEditing.value = false
  selectedTenantId.value = null
  form.value = {
    name: '',
    slug: '',
    planId: tenants.value[0]?.planId ?? '', // Default to first available plan ID
    status: 'TRIAL',
    logoUrl: '',
    primaryColor: '#3b82f6',
  }
  isSheetOpen.value = true
}

const handleEditClick = (tenantItem: TenantProfile) => {
  isEditing.value = true
  selectedTenantId.value = tenantItem.id ?? null
  form.value = {
    name: tenantItem.name,
    slug: tenantItem.slug,
    planId: tenantItem.planId,
    status: tenantItem.status,
    logoUrl: tenantItem.logoUrl ?? '',
    primaryColor: tenantItem.primaryColor ?? '#3b82f6',
  }
  isSheetOpen.value = true
}

const handleSave = async () => {
  try {
    if (isEditing.value && selectedTenantId.value) {
      await updateTenant(selectedTenantId.value, form.value)
      toast.success('Tenant berhasil diperbarui')
    } else {
      await createTenant(form.value)
      toast.success('Tenant baru berhasil dibuat')
    }
    isSheetOpen.value = false
    await fetchTenants()
  } catch {
    toast.error(error.value ?? 'Gagal menyimpan data tenant')
  }
}

const handleDelete = async (id: string) => {
  if (
    confirm(
      'Apakah Anda yakin ingin menghapus tenant ini? Semua organisasi dan unit di bawahnya akan dinonaktifkan.',
    )
  ) {
    try {
      await deleteTenant(id)
      toast.success('Tenant berhasil dihapus')
      await fetchTenants()
    } catch {
      toast.error(error.value ?? 'Gagal menghapus tenant')
    }
  }
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'default'
    case 'TRIAL':
      return 'secondary'
    case 'SUSPENDED':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Aktif'
    case 'TRIAL':
      return 'Uji Coba'
    case 'SUSPENDED':
      return 'Ditangguhkan'
    case 'CANCELLED':
      return 'Dibatalkan'
    default:
      return status
  }
}
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8 space-y-6">
    <div
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Manajemen Tenant</h1>
        <p class="text-muted-foreground text-sm mt-1">
          Kelola data yayasan (tenant) dan paket langganan.
        </p>
      </div>
      <Button @click="handleAddClick">
        <Plus class="size-4 mr-2" />
        Tambah Tenant
      </Button>
    </div>

    <Card class="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/4">
      <CardHeader class="border-b px-6 py-5">
        <CardTitle class="text-xl font-bold">Daftar Tenant Aktif</CardTitle>
      </CardHeader>
      <CardContent class="p-0">
        <div
          v-if="isLoading"
          class="py-12 text-center text-sm text-muted-foreground"
        >
          Memuat data tenant...
        </div>
        <div
          v-else-if="tenants.length === 0"
          class="py-12 text-center text-sm text-muted-foreground"
        >
          Belum ada tenant yang terdaftar.
        </div>
        <div
          v-else
          class="overflow-x-auto"
        >
          <table class="w-full border-collapse text-left text-sm">
            <thead>
              <tr
                class="border-b bg-muted/40 font-semibold text-muted-foreground"
              >
                <th class="px-6 py-4">Nama Yayasan / Tenant</th>
                <th class="px-6 py-4">Subdomain / Slug</th>
                <th class="px-6 py-4">Paket Langganan</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              <tr
                v-for="item in tenants"
                :key="item.id"
                class="hover:bg-muted/30 transition-colors"
              >
                <td class="px-6 py-4 font-medium text-foreground">
                  <div class="flex items-center gap-3">
                    <div
                      class="size-8 rounded-lg flex items-center justify-center font-bold text-sm text-white"
                      :style="{
                        backgroundColor: item.primaryColor ?? '#3b82f6',
                      }"
                    >
                      {{ item.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <span class="block">{{ item.name }}</span>
                      <span class="text-xs text-muted-foreground"
                        >ID: {{ item.id }}</span
                      >
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {{ item.slug }}.schoolhub.id
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="font-semibold text-primary">
                    {{ item.plan?.name ?? 'Paket Gratis' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <Badge :variant="getStatusBadgeVariant(item.status)">
                    {{ getStatusLabel(item.status) }}
                  </Badge>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="handleEditClick(item)"
                    >
                      <Pencil
                        class="size-4 text-muted-foreground hover:text-foreground"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      @click="handleDelete(item.id!)"
                    >
                      <Trash2
                        class="size-4 text-destructive/70 hover:text-destructive"
                      />
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Slide-over panel for Create/Edit -->
  <Sheet v-model:open="isSheetOpen">
    <SheetContent class="w-full sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>{{
          isEditing ? 'Ubah Tenant' : 'Tambah Tenant Baru'
        }}</SheetTitle>
        <SheetDescription>
          Isi formulir di bawah ini untuk
          {{ isEditing ? 'memperbarui' : 'mendaftarkan' }} tenant baru ke
          platform.
        </SheetDescription>
      </SheetHeader>

      <div class="space-y-4 py-6">
        <div class="space-y-1">
          <label class="text-sm font-semibold">Nama Yayasan / Tenant</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full p-2 border rounded-lg bg-background text-sm"
            placeholder="Contoh: Yayasan Al-Azhar"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm font-semibold">Slug Subdomain</label>
          <div
            class="flex items-center border rounded-lg overflow-hidden bg-background"
          >
            <input
              v-model="form.slug"
              type="text"
              class="flex-1 p-2 bg-transparent text-sm focus:outline-none"
              placeholder="al-azhar"
              :disabled="isEditing"
            />
            <span
              class="bg-muted px-3 py-2 text-xs text-muted-foreground font-mono"
            >
              .schoolhub.id
            </span>
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-semibold">Status Tenant</label>
          <select
            v-model="form.status"
            class="w-full p-2 border rounded-lg bg-background text-sm"
          >
            <option value="TRIAL">Uji Coba (Trial)</option>
            <option value="ACTIVE">Aktif (Active)</option>
            <option value="SUSPENDED">Ditangguhkan (Suspended)</option>
            <option value="CANCELLED">Dibatalkan (Cancelled)</option>
          </select>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-semibold">Warna Tema Utama</label>
          <div class="flex items-center gap-3">
            <input
              v-model="form.primaryColor"
              type="color"
              class="size-10 border rounded-lg cursor-pointer bg-background p-1"
            />
            <input
              v-model="form.primaryColor"
              type="text"
              class="flex-1 p-2 border rounded-lg bg-background text-sm font-mono"
              placeholder="#3b82f6"
            />
          </div>
        </div>

        <div class="space-y-1">
          <label class="text-sm font-semibold">Logo URL (Opsional)</label>
          <input
            v-model="form.logoUrl"
            type="text"
            class="w-full p-2 border rounded-lg bg-background text-sm"
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>

      <SheetFooter class="border-t pt-4 flex gap-2">
        <Button
          variant="outline"
          @click="isSheetOpen = false"
          >Batal</Button
        >
        <Button
          :disabled="isSaving"
          @click="handleSave"
        >
          {{ isSaving ? 'Menyimpan...' : 'Simpan' }}
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
</template>
