import { useProfileStore } from '../stores/profileStore'
import { profileApi } from '../api/profileApi'
import { toast } from 'vue-sonner'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import type {
  AuthUser,
  ParentRecord,
  ProfileUpdatePayload,
  AddressRecord,
} from '../types'

export const profileService = {
  fetchProfileData: async (
    authUser: AuthUser,
    isViewingOther: boolean,
    _targetRole?: string,
    targetId?: string,
  ) => {
    const store = useProfileStore()
    store.loading = true

    try {
      let res

      if (isViewingOther && targetId) {
        res = await profileApi.getProfileByUserId(targetId)
      } else {
        if (!authUser?.id || !authUser?.roles?.length) {
          toast.error('Sesi tidak valid', {
            description: 'Silakan login ulang.',
          })
          return
        }
        res = await profileApi.getMyProfile()
      }

      const data = res.data.data
      if (!data?.profile) {
        toast.error('Profil tidak ditemukan')
        return
      }

      const { profile, teacher, student, userRoles } = data
      const roles = userRoles?.map((ur) => ur.role?.code).filter(Boolean) ?? []

      const teacherPositions = teacher?.teacherPositions ?? []
      const primaryPosition = teacherPositions.find((ep) => ep.isPrimary)
      const additionalPositions = teacherPositions.filter((ep) => !ep.isPrimary)

      const addresses: AddressRecord[] =
        teacher?.addresses ?? student?.addresses ?? []
      const primaryAddress = addresses.find((a) => a.isPrimary) ?? addresses[0]

      const parents = student?.parents ? mapParentData(student.parents) : []

      const subjectAssignments = teacher?.teachingAssignments ?? []

      store.rawProfile = {
        ...(profile || {}),
        roles,
        teacher,
        student,
        address: primaryAddress ?? null,
      }

      store.profileData = {
        roles,
        nik: profile?.nik,
        nip: teacher?.nip ?? null,
        nuptk: teacher?.nuptk ?? null,
        nis: student?.nis ?? null,
        nisn: student?.nisn ?? null,

        fullName: profile?.name,
        birthPlace: profile?.birthPlace,
        birthDate: profile?.birthDate
          ? new Date(profile.birthDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : '-',
        gender: profile?.gender,
        email: profile?.email,
        phone: profile?.phone,
        bloodType: profile?.bloodType?.name ?? null,
        religion: profile?.religion?.name ?? null,
        maritalStatus: profile?.maritalStatus,
        kk: profile?.kk,
        npwp: profile?.npwp,

        schoolIdentity: {
          employmentStatus: teacher?.employmentType?.name ?? null,
          primaryPosition: primaryPosition?.position?.name ?? '-',
          additionalDuties:
            additionalPositions
              .map((ep) => ep.position?.name)
              .filter(Boolean)
              .join(', ') || '-',
          positionCategory: primaryPosition?.position?.category?.name ?? null,
          hireDate: primaryPosition?.hireDate
            ? new Date(primaryPosition.hireDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            : '-',
          taughtSubjects:
            subjectAssignments
              .map((sa) => sa.subject?.name)
              .filter(Boolean)
              .join(', ') || '-',
          className: student?.class?.name ?? '-',
          gradeLevel: student?.class?.level ?? '-',
          supervisorName:
            student?.class?.supervisor?.user?.profile?.name ?? '-',
        },

        address: primaryAddress
          ? {
              street: primaryAddress.street,
              rt: primaryAddress.rt,
              rw: primaryAddress.rw,
              village: primaryAddress.village,
              district: primaryAddress.district,
              city: primaryAddress.city,
              province: primaryAddress.province,
              country: primaryAddress.country ?? 'Indonesia',
              postalCode: primaryAddress.postalCode,
            }
          : null,

        parents,
        educationHistory: profile?.educationalHistories ?? [],
        studentHistory: profile?.educationalHistories ?? [],

        achievements: profile?.achievements ?? [],
        scholarships: profile?.scholarships ?? [],

        positions: teacherPositions,
      }
    } catch (err: unknown) {
      toast.error('Gagal memuat data profil', {
        description: getIndonesianErrorMessage(
          err,
          'Terjadi kesalahan saat mengambil data.',
        ),
      })
    } finally {
      store.loading = false
    }
  },

  updateProfile: async (payload: ProfileUpdatePayload, userId?: string) => {
    const store = useProfileStore()
    store.isSaving = true
    try {
      if (userId) {
        await profileApi.updateProfileByUserId(userId, payload)
      } else {
        await profileApi.updateMyProfile(payload)
      }
      toast.success('Berhasil', {
        description: 'Data diri berhasil diperbarui',
      })
      return { success: true }
    } catch (err: unknown) {
      toast.error('Gagal memperbarui profil', {
        description: getIndonesianErrorMessage(
          err,
          'Terjadi kesalahan saat menyimpan data.',
        ),
      })
      return { success: false }
    } finally {
      store.isSaving = false
    }
  },

  fetchSocialMedias: async (params: {
    page: number
    limit: number
    search: string
    role: string
  }) => {
    return await profileApi.getAllSocialMedias(params)
  },

  saveSocialMedia: async (
    userId: string,
    socialMediaId: string,
    payload: { platformId: string; username: string },
  ) => {
    if (socialMediaId) {
      return await profileApi.updateSocialMedia(userId, socialMediaId, payload)
    } else {
      return await profileApi.addSocialMedia(userId, payload)
    }
  },

  deleteSocialMedia: async (userId: string, id: string) => {
    return await profileApi.deleteSocialMedia(userId, id)
  },
}

function mapParentData(spData: ParentRecord[]) {
  return spData.map((sp) => ({
    type: sp.relation,
    name: sp.parent?.name,
    nik: sp.parent?.nik,
    birthPlace: sp.parent?.birthPlace,
    birthDate: sp.parent?.birthDate
      ? new Date(sp.parent.birthDate).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : '-',
    email: sp.parent?.email,
    phone: sp.parent?.phone,
    education: sp.parent?.education?.name,
    occupation: sp.parent?.occupation?.name,
    income: sp.parent?.income,
  }))
}
