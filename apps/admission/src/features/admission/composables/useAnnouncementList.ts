import { storeToRefs } from 'pinia'
import { announcementService } from '../services/announcementService'
import { useAnnouncementStore } from '../stores/announcementStore'

export function useAnnouncementList() {
  const store = useAnnouncementStore()
  const { announcements, waves, totalItems, loading, isSaving } =
    storeToRefs(store)

  return {
    announcements,
    waves,
    totalItems,
    loading,
    isSaving,
    fetchData: announcementService.fetchData,
    saveAnnouncement: announcementService.saveAnnouncement,
    publishAnnouncement: announcementService.publishAnnouncement,
    deleteAnnouncement: announcementService.deleteAnnouncement,
  }
}
