import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { categoryService } from '../services/taxonomyService'
import type {
  CategoryCreatePayload,
  CategoryUpdatePayload,
  PostCategory,
} from '../types'

/**
 * Categories are reference data, so they go through the `@241/master-data`
 * engine rather than a hand-built list view (ADR-0001). This config is the
 * entire management UI.
 *
 * `slug` is deliberately absent from the fields: it is a public address that
 * may already be shared, and an editor renaming a category should not have to
 * think about whether they are also breaking `/berita?categorySlug=prestasi`.
 * The API derives it on create and leaves it alone on rename.
 */
export function useCategoryConfig(): MasterDataConfig<
  PostCategory,
  CategoryCreatePayload,
  CategoryUpdatePayload
> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Kategori', plural: 'Kategori' },
    permissions: {
      canCreate: can('portal-categories.create'),
      canUpdate: can('portal-categories.update'),
      canDelete: can('portal-categories.delete'),
    },
    service: {
      list: () => categoryService.list(),
      create: (payload) => categoryService.create(payload),
      update: (id, payload) => categoryService.update(id, payload),
      remove: (id, callbacks) => categoryService.remove(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Nama Kategori',
        required: true,
        maxLength: 100,
        placeholder: 'Misal: Prestasi',
      },
      {
        key: 'description',
        kind: 'text',
        label: 'Keterangan',
        maxLength: 200,
        placeholder: 'Opsional — untuk staf, tidak tampil di portal',
      },
      // Deactivating is how a category with history is retired: deletion is
      // refused while anything still points at it (FR-036, FR-037).
      { key: 'isActive', kind: 'boolean', label: 'Status', default: true },
    ],
  }
}
