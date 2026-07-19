import type { ApiSingleResponse } from '@/shared/types/api'
import type { DashboardSummary } from '../types'
import api from '@/shared/utils/api'

export const dashboardApi = {
  getSummary: () => {
    return api.get<ApiSingleResponse<DashboardSummary>>('/dashboard/summary')
  },
}
