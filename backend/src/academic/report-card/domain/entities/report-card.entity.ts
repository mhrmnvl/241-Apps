export interface ReportCardEntity {
  id: string;
  studentEnrollmentId?: string;
  enrollmentId?: string;
  academicSummary?: string | null;
  extracurricularNotes?: string | null;
  teacherNotes?: string | null;
  teacherNote?: string | null;
  totalAverage?: number | null;
  rank?: number | null;
  isPublished?: boolean;
  publishedAt?: Date | null;
  deletedAt?: Date | null;
}

/**
 * One subject's line, exactly as it was frozen when the card was generated.
 *
 * Read, never recomputed — the PDF and the detail view print these figures so
 * a card that has already gone home keeps saying what it said.
 */
export interface ReportCardSubjectEntity {
  subjectId: string;
  subjectCode?: string | null;
  subjectName: string;
  score: number;
  passingScore: number;
  predicate: string;
  description: string;
  isComplete: boolean;
}

export interface ReportCardWithDetails extends ReportCardEntity {
  subjects?: ReportCardSubjectEntity[];
  enrollment?: {
    id: string;
    student?: {
      nis?: string | null;
      user?: {
        profile?: {
          name?: string | null;
        } | null;
      } | null;
    } | null;
    classroom?: {
      name?: string | null;
      code?: string | null;
    } | null;
    semester?: {
      type?: {
        name?: string | null;
      } | null;
      academicYear?: {
        name?: string | null;
      } | null;
    } | null;
  } | null;
  scores?: { id: string; assessmentItemId: string; score: number | null }[];
}
