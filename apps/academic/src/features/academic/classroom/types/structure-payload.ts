export interface ClassroomStructureQueryParams {
  page?: number
  limit?: number
  classroomId?: string
  semesterId?: string
}

export interface ClassroomStructureSavePayload {
  classroomId: string
  semesterId: string
  presidentId?: string | null
  vicePresidentId?: string | null
  secretaryId?: string | null
  treasurerId?: string | null
}
