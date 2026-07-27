<script setup lang="ts">
import { Badge } from '@/ui/badge'
import { Button } from '@/ui/button'
import { DOCUMENT_STATUS_LABELS } from '../types'
import type { AdmissionDocument, AdmissionDocumentType } from '../types'

const props = defineProps<{
  documentTypes: AdmissionDocumentType[]
  documents: AdmissionDocument[]
  documentFiles: Record<string, File | null>
  uploadingDoc: string | null
  editable: boolean
  onFileChange: (typeCode: string, event: Event) => void
  onUpload: (typeCode: string) => void
}>()

function documentFor(typeId: string) {
  return props.documents.find((d) => d.documentTypeId === typeId)
}
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="docType in documentTypes"
      :key="docType.id"
      class="rounded-md border p-4"
    >
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p class="font-medium">
            {{ docType.name }}
            <Badge
              v-if="!docType.isRequired"
              variant="secondary"
              class="ml-1"
            >
              Opsional
            </Badge>
          </p>
          <p
            v-if="documentFor(docType.id)"
            class="text-sm text-muted-foreground"
          >
            {{ documentFor(docType.id)?.file.originalName }} ·
            {{
              DOCUMENT_STATUS_LABELS[
                documentFor(docType.id)?.status ?? 'PENDING'
              ]
            }}
            <span
              v-if="documentFor(docType.id)?.note"
              class="text-destructive"
            >
              — {{ documentFor(docType.id)?.note }}
            </span>
          </p>
          <p
            v-else
            class="text-sm text-muted-foreground"
          >
            Belum diunggah (JPG/PNG/PDF, maks. 5 MB)
          </p>
        </div>
        <div
          v-if="editable"
          class="flex items-center gap-2"
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            class="max-w-52 text-sm"
            @change="onFileChange(docType.code, $event)"
          />
          <Button
            size="sm"
            :disabled="
              uploadingDoc === docType.code || !documentFiles[docType.code]
            "
            @click="onUpload(docType.code)"
          >
            {{ uploadingDoc === docType.code ? 'Mengunggah…' : 'Unggah' }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
