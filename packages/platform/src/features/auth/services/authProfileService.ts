import type {
  AuthUser,
  AuthProfile,
  ProfileEnvelope,
  ExtractEnvelope,
} from '../types'
import { profileApi } from '@/features/platform/profile'

function extractProfile(payload: unknown): AuthProfile | null {
  if (!payload || typeof payload !== 'object') return null

  const envelope = payload as ExtractEnvelope
  const raw = (envelope.data ?? payload) as ProfileEnvelope

  if (!raw || typeof raw !== 'object') return null

  const nested = raw.profile ?? raw

  return {
    id: nested.id ?? raw.id,
    name: nested.name ?? null,
    email: nested.email ?? null,
    avatar: nested.avatar ?? null,
  }
}

export const authProfileService = {
  enrichUserWithProfile: async (user: AuthUser): Promise<AuthUser> => {
    try {
      const profileRes = await profileApi.getMyProfile()
      const data = profileRes.data?.data
      const profile = extractProfile(profileRes.data)
      const roles: string[] =
        data?.userRoles?.map((ur) => ur.role.code) ?? user.roles ?? []

      return {
        ...user,
        roles,
        name: data?.profile?.name ?? profile?.name ?? user.name ?? null,
        profile: {
          ...(user.profile ?? {}),
          ...(profile ?? {}),
        },
      }
    } catch {
      return user
    }
  },
}
