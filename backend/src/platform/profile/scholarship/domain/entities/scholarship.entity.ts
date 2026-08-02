export interface ScholarshipEntity {
  id: string;
  profileId: string;
  name: string;
  provider: string;
  year: number;
  status: string;
  description?: string | null;
  deletedAt?: Date | null;
}
