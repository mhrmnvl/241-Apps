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
    // Was `POST /profiles?userId=`, which the backend stopped serving when the
    // address routes moved under their parent — and which had been ambiguous
    // with two other controllers claiming the same path.
    return api.post<ApiSingleResponse<AddressRecord>>(
      `/profiles/${userId}/addresses`,
      payload,
    )
  },
  updateMyAddress: (addressId: string, payload: AddressSavePayload) => {
    return api.patch<ApiSingleResponse<AddressRecord>>(
      `/profiles/me/addresses/${addressId}`,
      payload,
    )
  },
}
