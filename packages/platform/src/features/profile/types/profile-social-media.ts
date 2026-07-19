export interface SocialMediaAccount {
  id: string
  platformId: string
  username: string
  platformName: string
  platformBaseUrl: string
}

export interface SocialMediaItem {
  userId: string
  profileId: string
  profileName: string
  profileRole: string
  socialMedias: SocialMediaAccount[]
}

export interface SocialMediaColumnActions {
  onView?: (item: SocialMediaItem) => void
  onEdit?: (item: SocialMediaItem) => void
  onDelete?: (
    item: SocialMediaItem,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
}
