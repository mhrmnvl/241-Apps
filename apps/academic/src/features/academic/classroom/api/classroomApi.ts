import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  Classroom,
  CopyClassroomsResult,
  ClassroomQueryParams,
  ClassroomSavePayload,
  ClassroomSupervisorAssignment,
  ClassroomSupervisorQueryParams,
  ClassroomSupervisorSavePayload,
  ClassroomStructure,
  ClassroomStructureQueryParams,
  ClassroomStructureSavePayload,
} from '../types'

export const classroomApi = {
  getClassrooms: (params?: ClassroomQueryParams) => {
    return api.get<ApiPaginatedResponse<Classroom>>('/classrooms', { params })
  },

  getClassroomById: (id: string) => {
    return api.get<ApiSingleResponse<Classroom>>(`/classrooms/${id}`)
  },

  createClassroom: (payload: ClassroomSavePayload) => {
    return api.post<ApiSingleResponse<Classroom>>('/classrooms', payload)
  },

  updateClassroom: (id: string, payload: Partial<ClassroomSavePayload>) => {
    return api.patch<ApiSingleResponse<Classroom>>(`/classrooms/${id}`, payload)
  },

  deleteClassroom: (id: string) => {
    return api.delete(`/classrooms/${id}`)
  },

  getClassroomSupervisors: (params?: ClassroomSupervisorQueryParams) => {
    return api.get<ApiPaginatedResponse<ClassroomSupervisorAssignment>>(
      '/classroom-supervisors',
      { params },
    )
  },

  createClassroomSupervisor: (payload: ClassroomSupervisorSavePayload) => {
    return api.post<ApiSingleResponse<ClassroomSupervisorAssignment>>(
      '/classroom-supervisors',
      payload,
    )
  },

  updateClassroomSupervisor: (
    id: string,
    payload: ClassroomSupervisorSavePayload,
  ) => {
    return api.patch<ApiSingleResponse<ClassroomSupervisorAssignment>>(
      `/classroom-supervisors/${id}`,
      payload,
    )
  },

  deleteClassroomSupervisor: (id: string) => {
    return api.delete(`/classroom-supervisors/${id}`)
  },

  getClassroomStructures: (params?: ClassroomStructureQueryParams) => {
    return api.get<ApiPaginatedResponse<ClassroomStructure>>(
      '/classroom-structures',
      { params },
    )
  },

  createClassroomStructure: (payload: ClassroomStructureSavePayload) => {
    return api.post<ApiSingleResponse<ClassroomStructure>>(
      '/classroom-structures',
      payload,
    )
  },

  updateClassroomStructure: (
    id: string,
    payload: Partial<ClassroomStructureSavePayload>,
  ) => {
    return api.patch<ApiSingleResponse<ClassroomStructure>>(
      `/classroom-structures/${id}`,
      payload,
    )
  },

  deleteClassroomStructure: (id: string) => {
    return api.delete(`/classroom-structures/${id}`)
  },

  /**
   * Clones one academic year's classrooms into another.
   *
   * Idempotent on the server, matched on grade and code, so a caller unsure
   * whether it already ran can simply run it again.
   */
  copyClassroomsToAcademicYear: (payload: {
    sourceAcademicYearId: string
    targetAcademicYearId: string
  }) => {
    return api.post<ApiSingleResponse<CopyClassroomsResult>>(
      '/classrooms/copy',
      payload,
    )
  },
}
