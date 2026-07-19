import { storeToRefs } from 'pinia'
import { useAnnouncementStore } from '../stores/announcementStore'
import { announcementService } from '../services/announcementService'

export function useAnnouncement() {
  const store = useAnnouncementStore()
  const {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    selectedClassroomId,
    searchQuery,
  } = storeToRefs(store)

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    selectedClassroomId,
    searchQuery,
    fetchFilterOptions: announcementService.fetchFilterOptions,
    fetchAnnouncements: announcementService.fetchAnnouncements,
    saveAnnouncement: announcementService.saveAnnouncement,
    deleteAnnouncement: announcementService.deleteAnnouncement,
  }
}
