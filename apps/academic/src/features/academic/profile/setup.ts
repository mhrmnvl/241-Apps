import {
  configureProfile,
  type ExtraTabPropsContext,
  type ExtraSheetContext,
} from '@/features/platform/profile'
import { PencilLine, Plus } from 'lucide-vue-next'

import SchoolIdentityTab from './components/SchoolIdentityTab.vue'
import ParentInfoTab from './components/ParentInfoTab.vue'

import {
  EducationalHistoryTab,
  EditEducationalHistoryDialog,
} from '@/features/academic/educational-history'

import {
  ScholarshipTab,
  EditScholarshipDialog,
} from '@/features/academic/scholarship'

import {
  AchievementTab,
  EditAchievementDialog,
} from '@/features/academic/achievement'

import {
  PositionTab,
  EditPositionDialog,
  EditTeacherIdentityDialog,
} from '@/features/academic/teacher'

import { EditStudentIdentityDialog } from '@/features/academic/student'

import { useSocialMedia } from '@/features/academic/social-media'

import {
  showEditIdentity,
  showEditEdu,
  showEditAchievement,
  showEditScholarship,
  showEditPosition,
  editingEduItem,
  editingAchievementItem,
  editingScholarshipItem,
  editingPositionItem,
  handleEditEdu,
  handleEditAchievement,
  handleEditScholarship,
  handleEditPosition,
} from './state'

export function setupProfileFeature() {
  configureProfile({
    socialMediaProvider: async () => {
      const { fetchSocialMedias, socialMedias } = useSocialMedia()
      await fetchSocialMedias({ limit: 100 })
      return socialMedias.value
    },
    extraTabs: [
      {
        value: 'identity',
        label: 'Identitas Pokok',
        component: SchoolIdentityTab,
        isEditable: true,
        actionConfig: { text: 'Ubah Identitas', icon: PencilLine },
        onActionClick: () => {
          showEditIdentity.value = true
        },
      },
      {
        value: 'parent',
        label: 'Data Ortu & Wali',
        component: ParentInfoTab,
        show: (roles: string[]) => roles.includes('STUDENT'),
      },
      {
        value: 'education',
        label: 'Riwayat Pendidikan',
        component: EducationalHistoryTab,
        props: (ctx: ExtraTabPropsContext) => ({
          data: ctx.profileData,
          isAdmin: ctx.isAdmin,
          onEdit: handleEditEdu,
          onReload: ctx.reloadProfile,
        }),
        isEditable: true,
        actionConfig: { text: 'Tambah Riwayat', icon: Plus },
        onActionClick: () => {
          editingEduItem.value = null
          showEditEdu.value = true
        },
      },
      {
        value: 'scholarship',
        label: 'Beasiswa',
        component: ScholarshipTab,
        props: (ctx: ExtraTabPropsContext) => ({
          data: ctx.profileData,
          isAdmin: ctx.isAdmin,
          onEdit: handleEditScholarship,
          onReload: ctx.reloadProfile,
        }),
        isEditable: true,
        actionConfig: { text: 'Tambah Beasiswa', icon: Plus },
        onActionClick: () => {
          editingScholarshipItem.value = null
          showEditScholarship.value = true
        },
      },
      {
        value: 'achievement',
        label: 'Prestasi',
        component: AchievementTab,
        props: (ctx: ExtraTabPropsContext) => ({
          data: ctx.profileData,
          isAdmin: ctx.isAdmin,
          onEdit: handleEditAchievement,
          onReload: ctx.reloadProfile,
        }),
        isEditable: true,
        actionConfig: { text: 'Tambah Prestasi', icon: Plus },
        onActionClick: () => {
          editingAchievementItem.value = null
          showEditAchievement.value = true
        },
      },
      {
        value: 'positions',
        label: 'Riwayat Jabatan',
        component: PositionTab,
        show: (roles: string[]) => !roles.includes('STUDENT'),
        props: (ctx: ExtraTabPropsContext) => ({
          data: ctx.profileData,
          teacherId: ctx.rawProfile?.teacher?.id,
          isAdmin: ctx.isAdmin,
          onEdit: handleEditPosition,
          onReload: ctx.reloadProfile,
        }),
        isEditable: true,
        actionConfig: { text: 'Tambah Jabatan', icon: Plus },
        onActionClick: () => {
          editingPositionItem.value = null
          showEditPosition.value = true
        },
      },
    ],
    extraSheets: [
      {
        component: EditTeacherIdentityDialog,
        props: (ctx: ExtraSheetContext) => ({
          open:
            showEditIdentity.value &&
            ctx.profileData &&
            !ctx.profileData.roles?.includes('STUDENT') &&
            ctx.rawProfile?.teacher?.id,
          'onUpdate:open': (val: boolean) => {
            showEditIdentity.value = val
          },
          teacherId: ctx.rawProfile?.teacher?.id,
          initialData: ctx.rawProfile?.teacher,
          onReload: ctx.reloadProfile,
        }),
      },
      {
        component: EditStudentIdentityDialog,
        props: (ctx: ExtraSheetContext) => ({
          open:
            showEditIdentity.value &&
            ctx.profileData &&
            ctx.profileData.roles?.includes('STUDENT') &&
            ctx.rawProfile?.student?.id,
          'onUpdate:open': (val: boolean) => {
            showEditIdentity.value = val
          },
          studentId: ctx.rawProfile?.student?.id,
          initialData: ctx.rawProfile?.student,
          onReload: ctx.reloadProfile,
        }),
      },
      {
        component: EditEducationalHistoryDialog,
        props: (ctx: ExtraSheetContext) => ({
          open: showEditEdu.value,
          'onUpdate:open': (val: boolean) => {
            showEditEdu.value = val
          },
          editingItem: editingEduItem.value,
          userId: ctx.userId,
          onReload: ctx.reloadProfile,
        }),
      },
      {
        component: EditAchievementDialog,
        props: (ctx: ExtraSheetContext) => ({
          open: showEditAchievement.value,
          'onUpdate:open': (val: boolean) => {
            showEditAchievement.value = val
          },
          editingItem: editingAchievementItem.value,
          profileId: ctx.userId,
          onReload: ctx.reloadProfile,
        }),
      },
      {
        component: EditScholarshipDialog,
        props: (ctx: ExtraSheetContext) => ({
          open: showEditScholarship.value,
          'onUpdate:open': (val: boolean) => {
            showEditScholarship.value = val
          },
          editingItem: editingScholarshipItem.value,
          userId: ctx.userId,
          onReload: ctx.reloadProfile,
        }),
      },
      {
        component: EditPositionDialog,
        props: (ctx: ExtraSheetContext) => ({
          open: showEditPosition.value && ctx.rawProfile?.teacher?.id,
          'onUpdate:open': (val: boolean) => {
            showEditPosition.value = val
          },
          editData: editingPositionItem.value,
          teacherId: ctx.rawProfile?.teacher?.id,
          onReload: ctx.reloadProfile,
        }),
      },
    ],
  })
}
