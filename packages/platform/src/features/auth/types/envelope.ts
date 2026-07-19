export interface ProfileEnvelope {
  id?: string
  name?: string | null
  email?: string | null
  avatar?: string | null
  profile?: {
    id?: string
    name?: string | null
    email?: string | null
    avatar?: string | null
  } | null
}

export interface ExtractEnvelope {
  data?: ProfileEnvelope | null
}
