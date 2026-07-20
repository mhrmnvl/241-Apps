export interface StudentParent {
  id: string
  studentId: string
  parentId: string
  relation: string
  isPrimary: boolean
  student?: {
    user?: {
      profile?: {
        name?: string
      }
    }
  }
  parent?: {
    name?: string
    nik?: string
    occupation?: {
      name?: string
    }
  }
}

export interface StudentParentSavePayload {
  studentId: string
  parentId: string
  relation: string
  isPrimary?: boolean
}

export interface StudentParentUpdatePayload {
  relation?: string
  isPrimary?: boolean
}

export interface StudentParentQueryParams {
  page?: number
  limit?: number
  search?: string
  studentId?: string
  parentId?: string
  relation?: string
  isPrimary?: boolean
}

export interface StudentParentColumnActions {
  onEdit: (item: StudentParent) => void
  onDelete: (
    item: StudentParent,
    callbacks: { setLoading: (state: boolean) => void; closeAlert: () => void },
  ) => void
}

export const PARENT_RELATIONS: Record<string, string> = {
  FATHER: 'Ayah',
  MOTHER: 'Ibu',
  GUARDIAN: 'Wali',
}

export const getParentRelationLabel = (relation?: string | null) => {
  if (!relation) return '-'
  return PARENT_RELATIONS[relation] ?? relation
}

export interface StudentOption {
  id: string
  name: string
  nisn: string
}

export interface ParentOption {
  id: string
  name: string
  nik: string
}

export interface StudentApiRecord {
  id: string
  nisn?: string
  user?: {
    profile?: {
      name?: string
    }
  }
}

export interface ParentApiRecord {
  id: string
  name?: string
  nik?: string
}

export interface StudentParentFormPayload {
  studentId: string
  parentId: string
  relation: string
  isPrimary: boolean
}
