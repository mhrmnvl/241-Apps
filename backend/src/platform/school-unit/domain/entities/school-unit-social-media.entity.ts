export interface SchoolUnitSocialMediaEntity {
  id: string;
  schoolUnitId: string;
  socialMediaId: string;
  username?: string | null;
  deletedAt?: Date | null;
}
