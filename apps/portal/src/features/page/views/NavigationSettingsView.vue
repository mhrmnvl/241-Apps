<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Button } from '@/ui/button'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
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
  // Exactly one destination — the API refuses anything else, and sending only
  // the chosen one is what makes that check pass rather than a merge problem.
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

/**
 * Reordering with buttons rather than pointer dragging.
 *
 * A menu is five to eight items edited a few times a year, and arrow buttons
 * are keyboard-operable and work on a phone without a drag library. The service
 * still sends the full order, so switching to dragging later changes only this
 * component.
 */
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
  <div class="mx-auto max-w-3xl space-y-6 p-6">
    <header>
      <h1 class="text-2xl font-semibold tracking-tight">Menu Portal</h1>
      <p class="text-sm text-muted-foreground">
        Urutan di sini adalah urutan di situs. Menu yang menaut ke halaman belum
        terbit otomatis disembunyikan dari pengunjung.
      </p>
    </header>

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
          <select
            id="nav-destination"
            v-model="draft.destination"
            class="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
          >
            <option value="route">Daftar bawaan</option>
            <option value="page">Halaman portal</option>
            <option value="external">Alamat luar</option>
          </select>
        </div>
      </div>

      <div
        v-if="draft.destination === 'route'"
        class="space-y-1.5"
      >
        <Label for="nav-route">Daftar</Label>
        <select
          id="nav-route"
          v-model="draft.routeKey"
          class="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
        >
          <option
            v-for="option in NAV_ROUTE_KEYS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div
        v-else-if="draft.destination === 'page'"
        class="space-y-1.5"
      >
        <Label for="nav-page">Halaman</Label>
        <select
          id="nav-page"
          v-model="draft.pageId"
          class="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
        >
          <option value="">Pilih halaman…</option>
          <option
            v-for="page in publishedPages"
            :key="page.id"
            :value="page.id"
          >
            {{ page.title }}
          </option>
        </select>
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
  </div>
</template>
