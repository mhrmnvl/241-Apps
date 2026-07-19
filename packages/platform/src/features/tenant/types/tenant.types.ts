export type TenantStatus = 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'

export interface TenantProfile {
  id?: string
  slug: string
  name: string
  planId: string
  status: TenantStatus
  trialEndsAt?: string | null
  subscriptionEndsAt?: string | null
  logoUrl?: string | null
  primaryColor?: string | null
  createdAt?: string
  updatedAt?: string
  plan?: {
    id: string
    code: string
    name: string
    price: number
  }
}
