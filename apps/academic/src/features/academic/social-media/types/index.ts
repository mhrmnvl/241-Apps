export interface SocialMedia {
  id: string
  name: string
  baseUrl: string
}

export interface SocialMediaCreatePayload {
  name: string
  baseUrl: string
}

export interface SocialMediaUpdatePayload {
  name?: string
  baseUrl?: string
}

export interface SocialMediaQuery {
  page?: number
  limit?: number
  search?: string
}

export interface SocialMediaColumnActions {
  onEdit: (item: SocialMedia) => void
  onDelete: (
    id: string,
    setLoading: (v: boolean) => void,
    closeAlert: () => void,
  ) => void
}
