import { storeToRefs } from 'pinia'
import { useAnnouncementStore } from '../stores/announcementStore'
import { announcementService } from '../services/announcementService'

export function useAnnouncement() {
  const store = useAnnouncementStore()
  const {
    items,
    totalItems,
    currentPage,
    pageSize,
    loading,
    isSaving,
    formError,
    classrooms,
    selectedClassroomId,
    searchQuery,
  } = storeToRefs(store)

  const setPage = async (page: number) => {
    store.currentPage = page
    await announcementService.fetchAnnouncements()
  }

  const setPageSize = async (size: number) => {
    store.pageSize = size
    store.currentPage = 1
    await announcementService.fetchAnnouncements()
  }

  return {
    items,
    totalItems,
    currentPage,
    pageSize,
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
    setPage,
    setPageSize,
  }
}
