export interface PositionCategoryOption {
  id: string
  code: string
  name: string
}

export interface Position {
  id: string
  name: string
  category: PositionCategoryOption
  isActive: boolean
}

export interface PositionSavePayload {
  name: string
  categoryId: string
  isActive?: boolean
}

export interface PositionUpdatePayload {
  name?: string
  categoryId?: string
  isActive?: boolean
}

export interface PositionQueryParams {
  page?: number
  limit?: number
  search?: string
  categoryId?: string
  isActive?: boolean
}

export interface PositionColumnActions {
  onEdit?: (item: Position) => void
  onDelete?: (
    item: Position,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
