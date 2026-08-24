import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { MyDashboard } from '../types'

/**
 * Unaddressed on purpose. The endpoint answers about whoever is signed in, and
 * there is deliberately no id to pass — see `dashboards.read-own`.
 */
export const myDashboardApi = {
  getMyDashboard: () => {
    return api.get<ApiSingleResponse<MyDashboard>>('/dashboards/me')
  },
}
