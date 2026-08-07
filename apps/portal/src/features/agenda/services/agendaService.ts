import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { agendaApi, publicAgendaApi } from '../api/agendaApi'
import { useAgendaStore } from '../stores/agendaStore'
import type {
  AgendaEntry,
  CreateAgendaPayload,
  PublicAgendaQuery,
  UpdateAgendaPayload,
} from '../types'

function statusOf(error: unknown): number | undefined {
  return (error as { response?: { status?: number } }).response?.status
}

const CONFLICT_MESSAGE =
  'Agenda ini sudah diubah oleh pengguna lain. Muat ulang sebelum menyimpan.'

export const agendaService = {
  async fetchList(search?: string) {
    const store = useAgendaStore()
    store.loading = true
    try {
      const { data } = await agendaApi.list({ search })
      store.entries = data.data ?? []
      store.total = data.meta?.total ?? store.entries.length
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat agenda.'))
    } finally {
      store.loading = false
    }
  },

  async fetchOne(id: string) {
    const store = useAgendaStore()
    store.loading = true
    store.reset()
    try {
      const { data } = await agendaApi.getById(id)
      store.current = data.data
      return data.data
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal memuat agenda.'))
      return null
    } finally {
      store.loading = false
    }
  },

  async create(payload: CreateAgendaPayload): Promise<AgendaEntry | null> {
    const store = useAgendaStore()
    store.isSaving = true
    try {
      const { data } = await agendaApi.create(payload)
      store.current = data.data
      toast.success('Draf agenda tersimpan.')
      return data.data
    } catch (error: unknown) {
      // The 400 for an invalid time range carries a message that names the
      // problem — passing it through beats a generic "failed to save".
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan agenda.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async update(
    id: string,
    payload: UpdateAgendaPayload,
  ): Promise<AgendaEntry | null> {
    const store = useAgendaStore()
    store.isSaving = true
    store.conflict = null
    try {
      const { data } = await agendaApi.update(id, payload)
      store.current = data.data
      toast.success('Perubahan tersimpan.')
      return data.data
    } catch (error: unknown) {
      if (statusOf(error) === 409) {
        store.conflict = CONFLICT_MESSAGE
        return null
      }
      toast.error(getIndonesianErrorMessage(error, 'Gagal menyimpan.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async setPublished(
    id: string,
    version: number,
    published: boolean,
    scheduledAt?: string,
  ): Promise<AgendaEntry | null> {
    const store = useAgendaStore()
    store.isSaving = true
    store.conflict = null
    try {
      const { data } = published
        ? await agendaApi.publish(id, version, scheduledAt)
        : await agendaApi.unpublish(id, version)
      store.current = data.data
      store.entries = store.entries.map((entry) =>
        entry.id === id ? data.data : entry,
      )
      toast.success(published ? 'Agenda diterbitkan.' : 'Agenda ditarik.')
      return data.data
    } catch (error: unknown) {
      if (statusOf(error) === 409) {
        store.conflict = CONFLICT_MESSAGE
        return null
      }
      toast.error(getIndonesianErrorMessage(error, 'Gagal mengubah status.'))
      return null
    } finally {
      store.isSaving = false
    }
  },

  async remove(id: string): Promise<boolean> {
    const store = useAgendaStore()
    try {
      await agendaApi.remove(id)
      store.entries = store.entries.filter((entry) => entry.id !== id)
      toast.success('Agenda dihapus.')
      return true
    } catch (error: unknown) {
      toast.error(getIndonesianErrorMessage(error, 'Gagal menghapus agenda.'))
      return false
    }
  },

  /** Anonymous. No toast — an error popup on the public site helps nobody. */
  async fetchPublicList(query: PublicAgendaQuery) {
    const store = useAgendaStore()
    store.loading = true
    store.unavailable = false
    try {
      const { data } = await publicAgendaApi.list(query)
      store.publicEntries = data.data ?? []
      store.publicTotal = data.meta?.total ?? store.publicEntries.length
    } catch {
      store.publicEntries = []
      store.publicTotal = 0
      store.unavailable = true
    } finally {
      store.loading = false
    }
  },

  async fetchPublicDetail(slug: string) {
    const store = useAgendaStore()
    store.loading = true
    store.resetPublic()
    try {
      const { data } = await publicAgendaApi.getBySlug(slug)
      store.publicCurrent = data.data
    } catch (error: unknown) {
      if (statusOf(error) === 404) store.notFound = true
      else store.unavailable = true
    } finally {
      store.loading = false
    }
  },
}
