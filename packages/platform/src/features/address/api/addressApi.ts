import type {
  ApiSingleResponse,
  ApiPaginatedResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { AddressSavePayload, AddressRecord } from '../types'

export const addressApi = {
  getAddressesByUserId: (userId: string) => {
    return api.get<ApiSingleResponse<AddressRecord>>(
      `/profiles/${userId}/addresses`,
    )
  },
  getMyAddresses: () => {
    return api.get<ApiPaginatedResponse<AddressRecord>>(
      '/profiles/me/addresses',
    )
  },
  createMyAddress: (payload: AddressSavePayload) => {
    return api.post<ApiSingleResponse<AddressRecord>>(
      '/profiles/me/addresses',
      payload,
    )
  },
  createAddressForUser: (userId: string, payload: AddressSavePayload) => {
    return api.post<ApiSingleResponse<AddressRecord>>('/profiles', payload, {
      params: { userId },
    })
  },
  updateMyAddress: (addressId: string, payload: AddressSavePayload) => {
    return api.patch<ApiSingleResponse<AddressRecord>>(
      `/profiles/me/addresses/${addressId}`,
      payload,
    )
  },
}
