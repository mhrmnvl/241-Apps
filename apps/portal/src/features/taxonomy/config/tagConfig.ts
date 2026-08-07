import { useRoleGuard } from '@/features/platform/auth'
import type { MasterDataConfig } from '@/master-data'
import { tagService } from '../services/taxonomyService'
import type { PostTag, TagCreatePayload, TagUpdatePayload } from '../types'

/**
 * Tags through the same engine as categories (ADR-0001), with one field.
 *
 * This screen exists for tidying up rather than setting up: tags are created
 * on first use from the post form (FR-038), so most of them arrive here
 * already made. Renaming fixes a typo without moving the public filter
 * address, and deleting drops the label while leaving every post untouched.
 */
export function useTagConfig(): MasterDataConfig<
  PostTag,
  TagCreatePayload,
  TagUpdatePayload
> {
  const { can } = useRoleGuard()

  return {
    entityLabel: { singular: 'Tag', plural: 'Tag' },
    permissions: {
      canCreate: can('portal-tags.create'),
      canUpdate: can('portal-tags.update'),
      canDelete: can('portal-tags.delete'),
    },
    service: {
      list: () => tagService.list(),
      create: (payload) => tagService.create(payload),
      update: (id, payload) => tagService.update(id, payload),
      remove: (id, callbacks) => tagService.remove(id, callbacks),
    },
    fields: [
      {
        key: 'name',
        kind: 'text',
        label: 'Nama Tag',
        required: true,
        maxLength: 60,
        placeholder: 'Misal: olimpiade',
      },
    ],
  }
}
