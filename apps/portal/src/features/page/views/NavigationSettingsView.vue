<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select'
import { Switch } from '@/ui/switch'
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  Trash2,
} from 'lucide-vue-next'
import { navigationService, pageService } from '../services/pageService'
import { usePageStore } from '../stores/pageStore'
import {
  NAV_ROUTE_KEYS,
  type CreateNavItemPayload,
  type NavItem,
} from '../types'

const store = usePageStore()

type Destination = 'page' | 'route' | 'external'

const draft = ref<{
  label: string
  destination: Destination
  pageId: string
  routeKey: string
  externalUrl: string
}>({
  label: '',
  destination: 'route',
  pageId: '',
  routeKey: 'berita',
  externalUrl: '',
})

onMounted(async () => {
  await Promise.all([navigationService.fetchList(), pageService.fetchList()])
})

const publishedPages = computed(() =>
  store.pages.filter((page) => page.status === 'PUBLISHED'),
)

const canAdd = computed(() => {
  if (!draft.value.label.trim()) return false
  if (draft.value.destination === 'page') return Boolean(draft.value.pageId)
  if (draft.value.destination === 'route') return Boolean(draft.value.routeKey)
  return Boolean(draft.value.externalUrl.trim())
})

function draftPayload(): CreateNavItemPayload {
  const base = { label: draft.value.label.trim() }
  if (draft.value.destination === 'page') {
    return { ...base, pageId: draft.value.pageId }
  }
  if (draft.value.destination === 'route') {
    return { ...base, routeKey: draft.value.routeKey }
  }
  return { ...base, externalUrl: draft.value.externalUrl.trim() }
}

async function add() {
  if (!canAdd.value) return
  const created = await navigationService.create(draftPayload())
  if (created) {
    draft.value.label = ''
    draft.value.externalUrl = ''
  }
}

async function move(index: number, delta: number) {
  const next = index + delta
  if (next < 0 || next >= store.navItems.length) return

  const reordered = [...store.navItems]
  const [moved] = reordered.splice(index, 1)
  if (!moved) return
  reordered.splice(next, 0, moved)

  await navigationService.reorder(reordered.map((item) => item.id))
}

async function toggleActive(item: NavItem) {
  await navigationService.update(item.id, { isActive: !item.isActive })
}

async function remove(item: NavItem) {
  if (!window.confirm(`Hapus menu "${item.label}"?`)) return
  await navigationService.remove(item.id)
}

function describe(item: NavItem): string {
  if (item.externalUrl) return item.externalUrl
  if (item.routeKey) return `Daftar ${item.routeKey}`
  const page = store.pages.find((candidate) => candidate.id === item.pageId)
  return page ? `/${page.slug}` : 'Halaman tidak ditemukan'
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
            >Menu Portal</CardTitle
          >
        </div>
      </CardHeader>

      <CardContent class="p-6 space-y-6">
        <section class="space-y-3 rounded-md border p-4">
          <h2 class="text-sm font-medium">Tambah menu</h2>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-1.5">
              <Label for="nav-label">Label</Label>
              <Input
                id="nav-label"
                v-model="draft.label"
                placeholder="mis. Profil"
              />
            </div>

            <div class="space-y-1.5">
              <Label for="nav-destination">Tujuan</Label>
              <Select v-model="draft.destination">
                <SelectTrigger
                  id="nav-destination"
                  class="w-full"
                >
                  <SelectValue placeholder="Pilih tujuan…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="route">Daftar bawaan</SelectItem>
                  <SelectItem value="page">Halaman portal</SelectItem>
                  <SelectItem value="external">Alamat luar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            v-if="draft.destination === 'route'"
            class="space-y-1.5"
          >
            <Label for="nav-route">Daftar</Label>
            <Select v-model="draft.routeKey">
              <SelectTrigger
                id="nav-route"
                class="w-full"
              >
                <SelectValue placeholder="Pilih daftar…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in NAV_ROUTE_KEYS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div
            v-else-if="draft.destination === 'page'"
            class="space-y-1.5"
          >
            <Label for="nav-page">Halaman</Label>
            <Select v-model="draft.pageId">
              <SelectTrigger
                id="nav-page"
                class="w-full"
              >
                <SelectValue placeholder="Pilih halaman…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="page in publishedPages"
                  :key="page.id"
                  :value="page.id"
                >
                  {{ page.title }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-xs text-muted-foreground">
              Hanya halaman yang sudah terbit yang dapat dipilih.
            </p>
          </div>

          <div
            v-else
            class="space-y-1.5"
          >
            <Label for="nav-external">Alamat</Label>
            <Input
              id="nav-external"
              v-model="draft.externalUrl"
              placeholder="https://ppdb.example.sch.id"
            />
          </div>

          <Button
            :disabled="!canAdd"
            @click="add"
          >
            <Plus class="mr-2 size-4" />
            Tambah
          </Button>
        </section>

        <section class="space-y-2">
          <p
            v-if="store.navItems.length === 0"
            class="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground"
          >
            Belum ada menu. Portal menampilkan menu bawaan sampai ada yang
            ditambahkan di sini.
          </p>

          <div
            v-for="(item, index) in store.navItems"
            :key="item.id"
            class="flex items-center gap-3 rounded-md border p-3"
          >
            <GripVertical class="size-4 shrink-0 text-muted-foreground" />

            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ item.label }}</p>
              <p class="truncate text-xs text-muted-foreground">
                {{ describe(item) }}
              </p>
            </div>

            <Switch
              :model-value="item.isActive"
              :aria-label="`Tampilkan ${item.label}`"
              @update:model-value="toggleActive(item)"
            />

            <Button
              variant="ghost"
              size="icon"
              title="Naikkan"
              :disabled="index === 0"
              @click="move(index, -1)"
            >
              <ChevronUp class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Turunkan"
              :disabled="index === store.navItems.length - 1"
              @click="move(index, 1)"
            >
              <ChevronDown class="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Hapus"
              @click="remove(item)"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
        </section>
      </CardContent>
    </Card>
  </div>
</template>
