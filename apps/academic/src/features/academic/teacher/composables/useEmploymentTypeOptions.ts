import { onMounted, ref } from 'vue'
import api from '@/shared/utils/api'
import type { EmploymentTypeOption } from '../types'

export function useEmploymentTypeOptions() {
  const employmentTypes = ref<EmploymentTypeOption[]>([])

  async function fetchEmploymentTypes() {
    try {
      const res = await api.get<{ data: EmploymentTypeOption[] }>(
        '/employment-types',
        { params: { limit: 100 } },
      )
      employmentTypes.value = res.data.data ?? []
    } catch {
      // non-blocking
    }
  }

  onMounted(fetchEmploymentTypes)

  return { employmentTypes, fetchEmploymentTypes }
}
