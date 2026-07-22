import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useAttendanceStore } from '../stores/attendanceStore'
import { attendanceService } from '../services/attendanceService'

export function useAttendance() {
  const store = useAttendanceStore()
  const {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    semesters,
    selectedClassroomId,
    selectedSemesterId,
    selectedDate,
    selectedMonth,
    selectedYear,
    inputRows,
    recapItems,
    recapLoading,
    trendData,
    trendLoading,
    activeTab,
  } = storeToRefs(store)

  // Weighted class-wide percentage across the students currently shown in
  // recapItems (not a simple average of per-student percentages, so a
  // classroom with uneven attendance-taking days isn't skewed).
  const classPercentage = computed(() => {
    if (recapItems.value.length === 0) return 0
    const totals = recapItems.value.reduce(
      (acc, item) => {
        acc.attended += item.PRESENT + item.LATE
        acc.total += item.total
        return acc
      },
      { attended: 0, total: 0 },
    )
    if (totals.total === 0) return 0
    return Math.round((totals.attended / totals.total) * 1000) / 10
  })

  // Delta vs the previous month's percentage, derived from trendData (no
  // extra request). null when there's no recorded data for the prior month.
  const monthDelta = computed(() => {
    const current = trendData.value.find(
      (p) => p.month === selectedMonth.value && p.year === selectedYear.value,
    )
    if (!current) return null

    const prevMonth = selectedMonth.value === 1 ? 12 : selectedMonth.value - 1
    const prevYear =
      selectedMonth.value === 1 ? selectedYear.value - 1 : selectedYear.value
    const previous = trendData.value.find(
      (p) => p.month === prevMonth && p.year === prevYear,
    )
    if (!previous) return null

    return Math.round((current.percentage - previous.percentage) * 10) / 10
  })

  return {
    items,
    totalItems,
    loading,
    isSaving,
    formError,
    classrooms,
    semesters,
    selectedClassroomId,
    selectedSemesterId,
    selectedDate,
    selectedMonth,
    selectedYear,
    inputRows,
    recapItems,
    recapLoading,
    trendData,
    trendLoading,
    activeTab,
    classPercentage,
    monthDelta,
    fetchFilterOptions: attendanceService.fetchFilterOptions,
    loadAttendanceInput: attendanceService.loadAttendanceInput,
    bulkSaveAttendance: attendanceService.bulkSaveAttendance,
    fetchRecap: attendanceService.fetchRecapAndTrend,
  }
}
