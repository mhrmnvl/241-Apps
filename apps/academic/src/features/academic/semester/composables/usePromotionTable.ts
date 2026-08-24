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
  const filterClass = ref('')
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

      // Anything that names a student or a class from the previous roster goes
      // with it. Changing the academic year fetches a different cohort, and a
      // class filter left pointing at "VII-A" from the year before matches
      // nothing — both this table and the preview beside it would go blank
      // with nothing on screen to say why.
      filterClass.value = ''
      selectedIds.value = new Set()

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
    // Require a class to be chosen before showing any rows — the list spans
    // multiple grades and hundreds of students; an unprompted full dump is more
    // noise than signal.
    if (!filterClass.value) return []

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

  /**
   * Sends one student somewhere other than the class recommended for them.
   *
   * The recommendation pairs a class with its own section a grade up, which is
   * right for most of a cohort and wrong for the few a school moves on
   * purpose. The server validates the destination — right academic year, and
   * a level that goes up for PROMOTE or stays put for REPEAT — so what is
   * offered here has to be filtered to that, and what is chosen is trusted.
   */
  function setTargetClassroom(studentId: string, classroomId: string) {
    const d = decisions.value.get(studentId)
    if (!d) return

    decisions.value.set(studentId, { ...d, targetClassroomId: classroomId })
    emitDecisions()
  }

  /**
   * The same for everyone ticked, which is how a school that reshuffles its
   * classes each year works: a group at a time, not a student at a time.
   *
   * Only the ticked students move, and the selection survives so a mistake can
   * be undone by choosing again rather than by re-ticking thirty rows.
   */
  function setTargetClassroomForSelected(classroomId: string) {
    for (const studentId of selectedIds.value) {
      const d = decisions.value.get(studentId)
      if (!d) continue
      decisions.value.set(studentId, { ...d, targetClassroomId: classroomId })
    }
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
    setTargetClassroom,
    setTargetClassroomForSelected,
    openDeclineDialog,
    confirmDecline,
    bulkApprove,
    bulkDecline,
    confirmBulkDecline,
    handleConfirmDeclineModal,
  }
}
