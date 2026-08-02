export interface EducationalHistoryEntity {
  id: string;
  profileId: string;
  level: string;
  institution: string;
  major?: string | null;
  startYear: number;
  endYear?: number | null;
  status: string;
  deletedAt?: Date | null;
}
