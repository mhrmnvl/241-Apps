import { bloodTypeService } from '../services/bloodTypeService'

export function useBloodType() {
  return {
    getBloodTypes: bloodTypeService.getBloodTypes,
  }
}
