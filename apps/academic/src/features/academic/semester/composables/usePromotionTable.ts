import { computed, ref, watch, type Ref } from 'vue'
import type {
  PromotionRecommendationItem,
  PromotionStudentDecision,
} from '../types'

export function usePromotionTable(
  recommendations: Ref<PromotionRecommendationItem[]>,
  onUpdateDecisions: (decisions: PromotionStudentDecision[]) => void,
) {
  const decisions = ref<Map<string, PromotionStudentDecision>>(new Map())
  const searchQuery = ref('')
  const filterClass = ref('all')
  const filterStatus = ref('all')
  const selectedIds = ref<Set<string>>(new Set())
  const showDeclineDialog = ref(false)
  const declineTarget = ref<string | null>(null)
  const declineReason = ref('')

  function emitDecisions() {
    onUpdateDecisions(Array.from(decisions.value.values()))
  }

  watch(
    recommendations,
    (items) => {
      const map = new Map<string, PromotionStudentDecision>()
      for (const item of items) {
        map.set(item.studentId, {
          studentId: item.studentId,
          sourceClassroomId: item.sourceClassroomId,
          targetClassroomId: item.targetClassroomId,
          action: item.recommendedAction,
          approved: true,
          declineReason: undefined,
        })
      }
      decisions.value = map
      emitDecisions()
    },
    { immediate: true },
  )

  const uniqueClasses = computed(() => {
    const set = new Set<string>()
    for (const r of recommendations.value) {
      set.add(r.sourceClassroomName)
    }
    return Array.from(set).sort()
  })

  const filteredRows = computed(() => {
    let items = recommendations.value

    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      items = items.filter(
        (r) =>
          r.studentName.toLowerCase().includes(q) ||
          r.nis.toLowerCase().includes(q),
      )
    }

    if (filterClass.value !== 'all') {
      items = items.filter((r) => r.sourceClassroomName === filterClass.value)
    }

    if (filterStatus.value !== 'all') {
      items = items.filter((r) => {
        const d = decisions.value.get(r.studentId)
        if (filterStatus.value === 'approved') return d?.approved === true
        if (filterStatus.value === 'declined') return d?.approved === false
        return true
      })
    }

    return items
  })

  const allVisibleSelected = computed(() => {
    if (filteredRows.value.length === 0) return false
    return filteredRows.value.every((r) => selectedIds.value.has(r.studentId))
  })

  const summaryStats = computed(() => {
    let approved = 0
    let declined = 0
    for (const d of decisions.value.values()) {
      if (d.approved) approved++
      else declined++
    }
    return { approved, declined, total: decisions.value.size }
  })

  function toggleSelectAll() {
    if (allVisibleSelected.value) {
      for (const r of filteredRows.value) {
        selectedIds.value.delete(r.studentId)
      }
    } else {
      for (const r of filteredRows.value) {
        selectedIds.value.add(r.studentId)
      }
    }
  }

  function toggleSelect(studentId: string) {
    if (selectedIds.value.has(studentId)) {
      selectedIds.value.delete(studentId)
    } else {
      selectedIds.value.add(studentId)
    }
  }

  function getDecision(
    studentId: string,
  ): PromotionStudentDecision | undefined {
    return decisions.value.get(studentId)
  }

  function approveStudent(studentId: string) {
    const d = decisions.value.get(studentId)
    if (!d) return
    const rec = recommendations.value.find((r) => r.studentId === studentId)
    if (!rec) return

    decisions.value.set(studentId, {
      ...d,
      approved: true,
      action: rec.recommendedAction,
      targetClassroomId: rec.targetClassroomId,
      declineReason: undefined,
    })
    emitDecisions()
  }

  function openDeclineDialog(studentId: string) {
    declineTarget.value = studentId
    declineReason.value = ''
    showDeclineDialog.value = true
  }

  function confirmDecline() {
    if (!declineTarget.value || !declineReason.value.trim()) return

    const d = decisions.value.get(declineTarget.value)
    const rec = recommendations.value.find(
      (r) => r.studentId === declineTarget.value,
    )
    if (!d || !rec) return

    const sameLevel = recommendations.value.find(
      (r) => r.sourceClassroomName === rec.sourceClassroomName,
    )

    decisions.value.set(declineTarget.value, {
      ...d,
      approved: false,
      action: 'REPEAT',
      targetClassroomId: sameLevel?.targetClassroomId,
      declineReason: declineReason.value.trim(),
    })

    showDeclineDialog.value = false
    declineTarget.value = null
    declineReason.value = ''
    emitDecisions()
  }

  function bulkApprove() {
    for (const id of selectedIds.value) {
      approveStudent(id)
    }
    selectedIds.value.clear()
  }

  function bulkDecline() {
    if (selectedIds.value.size === 0) return
    declineTarget.value = null
    declineReason.value = ''
    showDeclineDialog.value = true
  }

  function confirmBulkDecline() {
    if (!declineReason.value.trim()) return

    for (const studentId of selectedIds.value) {
      const d = decisions.value.get(studentId)
      const rec = recommendations.value.find((r) => r.studentId === studentId)
      if (!d || !rec) continue

      decisions.value.set(studentId, {
        ...d,
        approved: false,
        action: 'REPEAT',
        declineReason: declineReason.value.trim(),
      })
    }

    showDeclineDialog.value = false
    selectedIds.value.clear()
    emitDecisions()
  }

  function handleConfirmDeclineModal() {
    if (declineTarget.value) {
      confirmDecline()
    } else {
      confirmBulkDecline()
    }
  }

  return {
    decisions,
    searchQuery,
    filterClass,
    filterStatus,
    selectedIds,
    showDeclineDialog,
    declineTarget,
    declineReason,
    uniqueClasses,
    filteredRows,
    allVisibleSelected,
    summaryStats,
    toggleSelectAll,
    toggleSelect,
    getDecision,
    approveStudent,
    openDeclineDialog,
    confirmDecline,
    bulkApprove,
    bulkDecline,
    confirmBulkDecline,
    handleConfirmDeclineModal,
  }
}
