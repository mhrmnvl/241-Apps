import { ref } from 'vue'
import type { EducationalHistory } from '@/features/academic/educational-history'
import type { Achievement } from '@/features/academic/achievement'
import type { Scholarship } from '@/features/academic/scholarship'
import type { TeacherPosition } from '@/features/academic/teacher'

export const showEditIdentity = ref(false)
export const showEditEdu = ref(false)
export const showEditAchievement = ref(false)
export const showEditScholarship = ref(false)
export const showEditPosition = ref(false)

export const editingEduItem = ref<EducationalHistory | null>(null)
export const editingAchievementItem = ref<Achievement | null>(null)
export const editingScholarshipItem = ref<Scholarship | null>(null)
export const editingPositionItem = ref<TeacherPosition | null>(null)

export const handleEditEdu = (item: EducationalHistory) => {
  editingEduItem.value = item
  showEditEdu.value = true
}

export const handleEditAchievement = (item: Achievement) => {
  editingAchievementItem.value = item
  showEditAchievement.value = true
}

export const handleEditScholarship = (item: Scholarship) => {
  editingScholarshipItem.value = item
  showEditScholarship.value = true
}

export const handleEditPosition = (item: TeacherPosition) => {
  editingPositionItem.value = item
  showEditPosition.value = true
}
