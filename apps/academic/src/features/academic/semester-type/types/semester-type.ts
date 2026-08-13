export interface SemesterType {
  id: string
  name: string
  /** Order within an academic year — Ganjil 1, Genap 2. Smaller shows first. */
  sequence: number
  isActive: boolean
}

export interface SemesterTypeCreatePayload {
  name: string
  sequence?: number
  isActive: boolean
}

export interface SemesterTypeUpdatePayload {
  name?: string
  sequence?: number
  isActive?: boolean
}

export interface SemesterTypeQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
