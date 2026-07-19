import { educationService } from '../services/educationService'

export function useEducation() {
  return {
    getEducationLevels: educationService.getEducationLevels,
  }
}
