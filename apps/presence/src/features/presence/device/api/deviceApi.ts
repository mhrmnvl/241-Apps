import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  DeviceWithToken,
  GateDevice,
  RegisterDevicePayload,
} from '../types'

export const deviceApi = {
  getDevices: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiPaginatedResponse<GateDevice>>('/presence/devices', { params }),

  register: (payload: RegisterDevicePayload) =>
    api.post<ApiSingleResponse<DeviceWithToken>>('/presence/devices', payload),

  rotateToken: (id: string) =>
    api.post<ApiSingleResponse<DeviceWithToken>>(
      `/presence/devices/${id}/rotate-token`,
      {},
    ),

  update: (
    id: string,
    payload: Partial<RegisterDevicePayload> & { isActive?: boolean },
  ) =>
    api.patch<ApiSingleResponse<GateDevice>>(
      `/presence/devices/${id}`,
      payload,
    ),

  remove: (id: string) => api.delete(`/presence/devices/${id}`),
}
