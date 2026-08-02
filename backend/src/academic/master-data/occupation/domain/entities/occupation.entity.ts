export interface OccupationEntity {
  id: string;
  name: string;
  isActive: boolean;
  deletedAt?: Date | null;
}

export interface OccupationWithCount extends OccupationEntity {
  _count?: {
    parents?: number;
  };
}
