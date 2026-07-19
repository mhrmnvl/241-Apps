<script setup lang="ts">
/**
 * Komponen: Action Cell
 * Deskripsi: Komponen dropdown pengaturan aksi spesifik (lihat, edit, hapus) dalam sel DataTable
 *
 * Digunakan pada:
 * - Berbagai definisi tabel data di fitur (misal tabel profil, pengaturan akademik, dll)
 */
import { ref, computed } from 'vue'
import { Edit2, Eye, Trash2, Settings2, UserCheck } from 'lucide-vue-next'
import { Button } from '@/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/tooltip'

const props = defineProps<{
  editLabel?: string
  editIcon?: 'edit' | 'eye'
  viewLabel?: string
  manageLabel?: string
  deleteLabel?: string
  deleteTitle?: string
  deleteDescription?: string
  hideEdit?: boolean
  hideDelete?: boolean
}>()

const EditIcon = computed(() => (props.editIcon === 'eye' ? Eye : Edit2))

const emit = defineEmits<{
  edit: []
  view: []
  manage: []
  delete: [
    payload: { closeAlert: () => void; setLoading: (state: boolean) => void },
  ]
}>()

const isAlertOpen = ref(false)
const isDeleting = ref(false)

/**
 * Fungsi: Mengeksekusi event 'edit' saat menu Ubah dipilih
 */
function fireEdit() {
  emit('edit')
}

/**
 * Fungsi: Mengeksekusi event 'view' saat menu Lihat dipilih
 */
function fireView() {
  emit('view')
}

function fireManage() {
  emit('manage')
}

/**
 * Fungsi: Membuka dialog konfirmasi sebelum menghapus
 */
function fireDelete() {
  isAlertOpen.value = true
}

/**
 * Fungsi: Menyetujui konfirmasi hapus lalu melempar event ke luar komponen
 */
function confirmDelete() {
  const closeAlert = () => {
    isAlertOpen.value = false
  }
  const setLoading = (state: boolean) => {
    isDeleting.value = state
  }
  emit('delete', { closeAlert, setLoading })
}
</script>

<template>
  <div class="relative flex justify-center items-center">
    <Tooltip :delay-duration="300">
      <TooltipTrigger as-child>
        <DropdownMenu :modal="false">
          <DropdownMenuTrigger
            class="w-8 h-8 p-0 flex items-center justify-center data-[state=open]:bg-muted border-none text-muted-foreground hover:bg-muted focus:ring-0 shadow-none rounded-md outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
          >
            <span class="sr-only">Opsi</span>
            <Settings2 class="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            class="w-[190px] p-1.5 space-y-1"
          >
            <DropdownMenuItem
              v-if="viewLabel"
              class="cursor-pointer py-2.5 px-3"
              @click="fireView"
            >
              <div class="flex items-center gap-3">
                <Eye class="h-4 w-4" />
                <span>{{ viewLabel }}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="manageLabel"
              class="cursor-pointer py-2.5 px-3"
              @click="fireManage"
            >
              <div class="flex items-center gap-3">
                <UserCheck class="h-4 w-4" />
                <span>{{ manageLabel }}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="!hideEdit"
              class="cursor-pointer py-2.5 px-3"
              @click="fireEdit"
            >
              <div class="flex items-center gap-3">
                <component
                  :is="EditIcon"
                  class="h-4 w-4"
                />
                <span>{{ editLabel || 'Edit' }}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem
              v-if="!hideDelete"
              class="cursor-pointer py-2.5 px-3 text-destructive focus:bg-destructive/10 focus:text-destructive"
              @click="fireDelete"
            >
              <div class="flex items-center gap-3">
                <Trash2 class="h-4 w-4 text-destructive" />
                <span>{{ deleteLabel || 'Hapus' }}</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Pilihan Aksi</p>
      </TooltipContent>
    </Tooltip>

    <AlertDialog v-model:open="isAlertOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{
            deleteTitle || 'Apakah anda yakin?'
          }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ deleteDescription || 'Tindakan ini tidak dapat dibatalkan.' }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            :disabled="isDeleting"
            @click="isAlertOpen = false"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            :disabled="isDeleting"
            @click="confirmDelete"
          >
            {{ isDeleting ? 'Menghapus...' : deleteLabel || 'Hapus' }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
