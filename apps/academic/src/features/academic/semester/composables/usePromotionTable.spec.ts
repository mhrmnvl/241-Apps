import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { usePromotionTable } from './usePromotionTable'
import type {
  PromotionRecommendationItem,
  PromotionStudentDecision,
} from '../types'

const student = (
  id: string,
  classroom: string,
): PromotionRecommendationItem => ({
  studentId: id,
  studentName: `Siswa ${id}`,
  nis: id,
  sourceClassroomId: `${classroom}-id`,
  sourceClassroomName: classroom,
  sourceLevel: 'VII',
  recommendedAction: 'PROMOTE',
  targetClassroomId: 'viii-a-id',
  targetClassroomName: 'VIII-A',
  targetLevel: 'VIII',
})

function setup() {
  const recommendations = ref<PromotionRecommendationItem[]>([
    student('a1', 'VII-A'),
    student('a2', 'VII-A'),
    student('b1', 'VII-B'),
  ])

  let emitted: PromotionStudentDecision[] = []
  const table = usePromotionTable(recommendations, (decisions) => {
    emitted = decisions
  })

  return {
    recommendations,
    table,
    decisionFor: (id: string) => emitted.find((d) => d.studentId === id),
  }
}

describe('usePromotionTable — a tick belongs to the class it was made in', () => {
  /**
   * The defect this exists for. Ticking all of VII-A and then switching the
   * filter to VII-B left VII-A still selected and off screen, so the next bulk
   * action reached students the operator could not see and had not chosen.
   */
  it('drops the selection when the class filter changes', async () => {
    const { table } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    table.toggleSelectAll()
    expect(table.selectedIds.value.size).toBe(2)

    table.filterClass.value = 'VII-B'
    await nextTick()

    expect(table.selectedIds.value.size).toBe(0)
  })

  it('does not decline a student in a class that is not on screen', async () => {
    const { table, decisionFor } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    table.toggleSelectAll()

    // A tick that survived a filter change is what this guards against, so it
    // is forced here rather than reached through the filter.
    table.selectedIds.value.add('b1')

    table.declineReason.value = 'Kehadiran kurang'
    table.confirmBulkDecline()

    expect(decisionFor('a1')?.approved).toBe(false)
    expect(decisionFor('b1')?.approved).toBe(true)
  })

  it('does not move a student in a class that is not on screen', async () => {
    const { table, decisionFor } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    table.toggleSelectAll()
    table.selectedIds.value.add('b1')

    table.setTargetClassroomForSelected('viii-b-id')

    expect(decisionFor('a1')?.targetClassroomId).toBe('viii-b-id')
    expect(decisionFor('b1')?.targetClassroomId).toBe('viii-a-id')
  })

  /** A search narrows the class further, and a bulk action follows it. */
  it('acts on what the search left visible', async () => {
    const { table, decisionFor } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    table.toggleSelectAll()
    table.searchQuery.value = 'a1'
    await nextTick()

    table.declineReason.value = 'Nilai di bawah KKM'
    table.confirmBulkDecline()

    expect(decisionFor('a1')?.approved).toBe(false)
    expect(decisionFor('a2')?.approved).toBe(true)
  })
})

describe('usePromotionTable — declining forgets where the student was going', () => {
  /**
   * A repeating student kept the destination worked out for a promotion — the
   * class a grade up — and the server refuses that for the whole batch:
   * "REPEAT expects target level VII, but got VIII".
   */
  it('clears the target so a grade-up class is never sent for a REPEAT', async () => {
    const { table, decisionFor } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    expect(decisionFor('a1')?.targetClassroomId).toBe('viii-a-id')

    table.openDeclineDialog('a1')
    table.declineReason.value = 'Kehadiran kurang'
    table.confirmDecline()

    expect(decisionFor('a1')?.action).toBe('REPEAT')
    expect(decisionFor('a1')?.targetClassroomId).toBeUndefined()
  })

  it('clears it for everyone declined at once', async () => {
    const { table, decisionFor } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    table.toggleSelectAll()

    table.declineReason.value = 'Nilai di bawah KKM'
    table.confirmBulkDecline()

    expect(decisionFor('a1')?.targetClassroomId).toBeUndefined()
    expect(decisionFor('a2')?.targetClassroomId).toBeUndefined()
  })

  /**
   * Everyone declined now owes a destination, and "Pindahkan N ke..." is how a
   * group gives one. Clearing the ticks would mean re-ticking the same rows to
   * answer the question the decline just raised.
   */
  it('keeps the selection so the group can be given one', async () => {
    const { table } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    table.toggleSelectAll()

    table.declineReason.value = 'Nilai di bawah KKM'
    table.confirmBulkDecline()

    expect(table.selectedIds.value.size).toBe(2)
  })

  it('puts a student back where they were going when the decline is undone', async () => {
    const { table, decisionFor } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()

    table.openDeclineDialog('a1')
    table.declineReason.value = 'Kehadiran kurang'
    table.confirmDecline()

    table.approveStudent('a1')

    expect(decisionFor('a1')?.approved).toBe(true)
    expect(decisionFor('a1')?.action).toBe('PROMOTE')
    expect(decisionFor('a1')?.targetClassroomId).toBe('viii-a-id')
    expect(decisionFor('a1')?.declineReason).toBeUndefined()
  })
})

describe('usePromotionTable — a refetch is not always a new cohort', () => {
  /**
   * Copying classrooms forward refetches the recommendations, and that used to
   * wipe every decision on screen: half an hour of review gone, because the
   * screen went to learn about the new classes.
   */
  it('keeps decisions when the same cohort comes back', async () => {
    const { recommendations, table, decisionFor } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    table.openDeclineDialog('a1')
    table.declineReason.value = 'Kehadiran kurang'
    table.confirmDecline()

    // A fresh array of the same students, as a refetch produces.
    recommendations.value = [
      student('a1', 'VII-A'),
      student('a2', 'VII-A'),
      student('b1', 'VII-B'),
    ]
    await nextTick()

    expect(decisionFor('a1')?.approved).toBe(false)
    expect(decisionFor('a1')?.declineReason).toBe('Kehadiran kurang')
  })

  it('keeps the class on screen through that refetch', async () => {
    const { recommendations, table } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()

    recommendations.value = [student('a1', 'VII-A'), student('b1', 'VII-B')]
    await nextTick()

    expect(table.filterClass.value).toBe('VII-A')
    expect(table.filteredRows.value).toHaveLength(1)
  })

  /**
   * The opposite case, and the reason the test is on `sourceClassroomId`
   * rather than on the student: a decision names classroom ids, and ids belong
   * to the year they were fetched for. Carrying one across would send a
   * student to a classroom the server refuses.
   */
  it('starts over when the same student arrives from another year', async () => {
    const { recommendations, table, decisionFor } = setup()

    table.filterClass.value = 'VII-A'
    await nextTick()
    table.openDeclineDialog('a1')
    table.declineReason.value = 'Kehadiran kurang'
    table.confirmDecline()

    const nextYear = student('a1', 'VII-A')
    nextYear.sourceClassroomId = 'vii-a-id-2027'
    recommendations.value = [nextYear]
    await nextTick()

    expect(decisionFor('a1')?.approved).toBe(true)
    expect(decisionFor('a1')?.declineReason).toBeUndefined()
  })

  it('clears the filter when the class is not in the new list', async () => {
    const { recommendations, table } = setup()

    table.filterClass.value = 'VII-B'
    await nextTick()

    recommendations.value = [student('a1', 'VII-A')]
    await nextTick()

    expect(table.filterClass.value).toBe('')
  })
})
