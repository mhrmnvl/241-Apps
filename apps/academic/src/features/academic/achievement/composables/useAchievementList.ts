import { storeToRefs } from 'pinia'
import { useAchievementStore } from '../stores/achievementStore'
import { achievementService } from '../services/achievementService'

/**
 * The school-wide achievement list.
 *
 * Separate from `useAchievement`, which serves the profile tab: there the
 * person is the page and the rows are held by the tab itself. Here the person
 * is a column, and the table is paginated server-side.
 */
export function useAchievementList() {
  const store = useAchievementStore()

  const {
    items,
    totalItems,
    loading,
    isSaving,
    currentPage,
    pageSize,
    selectedTypeId,
    selectedYear,
  } = storeToRefs(store)

  function setPage(page: number) {
    store.currentPage = page
    void achievementService.fetchAchievements()
  }

  function setPageSize(size: number) {
    store.pageSize = size
    store.currentPage = 1
    void achievementService.fetchAchievements()
  }

  return {
    items,
    totalItems,
    loading,
    isSaving,
    currentPage,
    pageSize,
    selectedTypeId,
    selectedYear,
    fetchAchievements: achievementService.fetchAchievements,
    saveAchievement: achievementService.saveAchievement,
    deleteAchievement: achievementService.deleteAchievement,
    setPage,
    setPageSize,
  }
}
