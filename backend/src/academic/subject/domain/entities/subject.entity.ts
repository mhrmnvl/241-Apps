export interface SubjectEntity {
  id: string;
  code?: string | null;
  name: string;
  description?: string | null;
  isActive?: boolean;
  deletedAt?: Date | null;
}

/**
 * One teacher's assignment to this subject in a single classroom.
 *
 * Nullability mirrors the schema: a classroom may be unnamed and a teacher may
 * have no profile row yet, which is why the UI falls back to the NIP.
 */
export interface SubjectTeachingAssignment {
  id: string;
  teacherId: string;
  classroom: { id: string; name: string | null };
  teacher: {
    nip: string | null;
    user: { profile: { name: string } | null };
  };
}

/**
 * A subject as the list and detail endpoints return it: the active semester's
 * teaching assignments, which may name a different teacher per classroom.
 */
export interface SubjectWithTeachers extends SubjectEntity {
  _count?: {
    teachingAssignments?: number;
  };
  teachingAssignments?: SubjectTeachingAssignment[];
}
