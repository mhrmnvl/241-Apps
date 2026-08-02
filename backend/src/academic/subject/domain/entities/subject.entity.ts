export interface SubjectEntity {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  isActive?: boolean;
  deletedAt?: Date | null;
}

export interface SubjectWithCount extends SubjectEntity {
  _count?: {
    teachingAssignments?: number;
  };
}
