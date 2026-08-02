export interface AchievementEntity {
  id: string;
  profileId: string;
  typeId: string;
  name: string;
  level?: string | null;
  rank?: string | null;
  organizer?: string | null;
  year: number;
  description?: string | null;
  certificateFileId?: string | null;
  deletedAt?: Date | null;
}
