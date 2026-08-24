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

  /**
   * Rebuilds the decisions when a new list of recommendations arrives, keeping
   * the ones the operator already made where they still mean something.
   *
   * Two different things arrive through here and they need opposite answers.
   *
   * A *refetch of the same cohort* — which is what copying classrooms forward
   * does — used to wipe every decision on screen. Half an hour of review, gone,
   * because the screen fetched again to learn about the new classes.
   *
   * A *different academic year* must wipe them. A decision names classroom ids,
   * and the ids belong to the year they were fetched for; carrying one across
   * would send a student to a classroom the server refuses as "does not belong
   * to target academic year".
   *
   * `sourceClassroomId` tells the two apart. Classrooms are per academic year,
   * so a student whose source classroom is the same id is the same student in
   * the same year, and their decision still holds. A different id means a
   * different year's data, whatever the class is called.
   */
  watch(
    recommendations,
    (items) => {
      const previous = decisions.value
      const map = new Map<string, PromotionStudentDecision>()

      for (const item of items) {
        const kept = previous.get(item.studentId)
        const sameCohort = kept?.sourceClassroomId === item.sourceClassroomId

        map.set(
          item.studentId,
          sameCohort
            ? kept
            : {
                studentId: item.studentId,
                sourceClassroomId: item.sourceClassroomId,
                targetClassroomId: item.targetClassroomId,
                action: item.recommendedAction,
                approved: true,
                declineReason: undefined,
              },
        )
      }

      decisions.value = map

      // A class filter naming a class this cohort does not have matches
      // nothing, and the table goes blank with nothing on screen to say why —
      // which is what happened on every year change. Keeping it when the class
      // is still there is what lets a refetch leave the operator where they
      // were.
      const classStillListed = items.some(
        (item) => item.sourceClassroomName === filterClass.value,
      )
      if (!classStillListed) {
        filterClass.value = ''
        selectedIds.value = new Set()
      }

      emitDecisions()
    },
    { immediate: true },
  )

  const uniqueClasses = computed(() => {
    const set = new Set<string>()
    for (const r of recommendations.value) {
      // A blank name would become a `<SelectItem value="">`, which the select
      // rejects — and one bad item takes the whole list with it, leaving a
      // dropdown that opens onto nothing and cannot be dismissed by choosing.
      if (r.sourceClassroomName) set.add(r.sourceClassroomName)
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

  /**
   * Changing the class filter drops the ticks made in the previous class.
   *
   * The promotion runs one class at a time, and everything bulk acts on
   * `selectedIds` — approve, decline, and "Pindahkan N ke...". Ticking all of
   * VII-A and then switching to VIII-A left those thirty-four still selected
   * and off screen, so the next bulk action reached students the operator
   * could not see and had not chosen, and their decisions changed without
   * anything to show it.
   *
   * A tick means "this row, here". Carrying it into another class is carrying
   * a different sentence.
   */
  watch(filterClass, () => {
    selectedIds.value = new Set()
  })

  /**
   * The ticked rows that are actually on screen.
   *
   * Every bulk action goes through this rather than through `selectedIds`, so
   * a selection can never reach past what is being looked at — including past
   * a search that narrowed the class further. Clearing on a filter change is
   * what stops it happening; this is what makes it impossible.
   */
  const selectedVisibleRows = computed(() =>
    filteredRows.value.filter((row) => selectedIds.value.has(row.studentId)),
  )

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

  /**
   * Marks one student as staying where they are, and forgets where they were
   * going.
   *
   * Clearing the destination is the point. It used to be carried over from the
   * recommendation — the class a grade up — and the server refuses that:
   * "REPEAT expects target level VII, but got VIII". It validates every student
   * before it writes any of them, so one declined student took the whole class
   * down with them, with a message about levels that named nobody.
   *
   * A repeating student still enrols somewhere, in the grade they were already
   * in, and which section that is belongs to the school rather than to a guess
   * here. `canExecute` requires a destination, so the row's picker asks for one
   * and the button stays disabled until it has been given.
   */
  function confirmDecline() {
    if (!declineTarget.value || !declineReason.value.trim()) return

    const d = decisions.value.get(declineTarget.value)
    if (!d) return

    decisions.value.set(declineTarget.value, {
      ...d,
      approved: false,
      action: 'REPEAT',
      targetClassroomId: undefined,
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
    for (const row of selectedVisibleRows.value) {
      const d = decisions.value.get(row.studentId)
      if (!d) continue
      decisions.value.set(row.studentId, {
        ...d,
        targetClassroomId: classroomId,
      })
    }
    emitDecisions()
  }

  function bulkApprove() {
    for (const row of selectedVisibleRows.value) {
      approveStudent(row.studentId)
    }
    selectedIds.value.clear()
  }

  function bulkDecline() {
    if (selectedIds.value.size === 0) return
    declineTarget.value = null
    declineReason.value = ''
    showDeclineDialog.value = true
  }

  /**
   * The same for everyone ticked, and with the same destination cleared: these
   * rows kept a grade-up target too, which is the shape of defect that fails
   * the batch rather than the student.
   *
   * The selection survives, unlike everywhere else. Everyone here now needs a
   * destination chosen, and "Pindahkan N ke..." is how that is done for a
   * group — clearing the ticks would mean re-ticking the same rows to answer
   * the question this action just raised.
   */
  function confirmBulkDecline() {
    if (!declineReason.value.trim()) return

    for (const row of selectedVisibleRows.value) {
      const d = decisions.value.get(row.studentId)
      if (!d) continue

      decisions.value.set(row.studentId, {
        ...d,
        approved: false,
        action: 'REPEAT',
        targetClassroomId: undefined,
        declineReason: declineReason.value.trim(),
      })
    }

    showDeclineDialog.value = false
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
    selectedVisibleRows,
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
