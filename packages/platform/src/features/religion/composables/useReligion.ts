import { religionService } from '../services/religionService'

export function useReligion() {
  return {
    getReligions: religionService.getReligions,
  }
}
