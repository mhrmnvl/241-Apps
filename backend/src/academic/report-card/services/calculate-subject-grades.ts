import { AssessmentType } from '@prisma/client';

/** One scored assessment, as the calculator needs to see it. */
export interface ScoredAssessment {
  type: AssessmentType;
  /** Weight *within* its type. Defaults to 1, so untouched items rank equally. */
  itemWeight: number;
  /** What the item is out of. A score of 20 out of 25 is 80, not 20. */
  maxScore: number;
  score: number;
}

export interface SubjectGradeInput {
  subjectId: string;
  subjectCode: string | null;
  subjectName: string;
  /** The pass mark this subject is judged against, already resolved. */
  passingScore: number;
  /** Percentage each type contributes. Missing or non-positive types are ignored. */
  typeWeights: Partial<Record<AssessmentType, number>>;
  assessments: ScoredAssessment[];
}

export interface SubjectGradeRow {
  no: number;
  subjectId: string;
  code: string;
  name: string;
  /** Formatted to two decimals for printing. */
  score: string;
  /** The same number, for storing and averaging. */
  scoreValue: number;
  passingScore: number;
  predicate: string;
  description: string;
  isComplete: boolean;
}

const PREDICATE_DESCRIPTIONS = {
  A: 'Sangat Baik',
  B: 'Baik',
  C: 'Cukup',
  D: 'Kurang',
} as const;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * The Kurikulum 2013 scale: the D/C boundary *is* the passing score, and the range above
 * it splits into three equal bands.
 *
 * Deriving it rather than storing four thresholds is what makes it impossible
 * for a report card to call a student "Cukup" while also marking them not yet
 * passed — a contradiction any hand-entered scale eventually produces.
 */
export function predicateFor(
  score: number,
  passingScore: number,
): { predicate: keyof typeof PREDICATE_DESCRIPTIONS; isComplete: boolean } {
  const safePassingScore = Math.min(Math.max(passingScore, 0), 100);
  if (score < safePassingScore) return { predicate: 'D', isComplete: false };

  const interval = (100 - safePassingScore) / 3;
  // A passing score of 100 leaves no room to grade above it; passing is the top band.
  if (interval <= 0) return { predicate: 'A', isComplete: true };

  if (score < safePassingScore + interval)
    return { predicate: 'C', isComplete: true };
  if (score < safePassingScore + interval * 2)
    return { predicate: 'B', isComplete: true };
  return { predicate: 'A', isComplete: true };
}

/** Averages one type's assessments, each first expressed as a percentage. */
function scoreForType(assessments: ScoredAssessment[]): number | null {
  let weighted = 0;
  let totalWeight = 0;

  for (const assessment of assessments) {
    // A non-positive maximum cannot be divided by; a non-positive weight is
    // the teacher saying this one does not count.
    if (assessment.maxScore <= 0 || assessment.itemWeight <= 0) continue;
    const percentage = (assessment.score / assessment.maxScore) * 100;
    weighted += percentage * assessment.itemWeight;
    totalWeight += assessment.itemWeight;
  }

  return totalWeight > 0 ? weighted / totalWeight : null;
}

/**
 * One subject's final score, or null when nothing has been graded yet.
 *
 * Type weights are renormalised over the types that actually carry a score.
 * Without that, a report card pulled in the middle of the semester would score
 * every student against a final exam that has not happened — a class with only
 * daily marks in, weighted 40, would top out at 40. Renormalising means the
 * number always answers "out of what has been assessed so far".
 */
export function calculateSubjectScore(input: SubjectGradeInput): number | null {
  const byType = new Map<AssessmentType, ScoredAssessment[]>();
  for (const assessment of input.assessments) {
    const bucket = byType.get(assessment.type);
    if (bucket) bucket.push(assessment);
    else byType.set(assessment.type, [assessment]);
  }

  let weighted = 0;
  let totalWeight = 0;

  for (const [type, assessments] of byType) {
    const typeWeight = input.typeWeights[type] ?? 0;
    if (typeWeight <= 0) continue;

    const typeScore = scoreForType(assessments);
    if (typeScore === null) continue;

    weighted += typeScore * typeWeight;
    totalWeight += typeWeight;
  }

  return totalWeight > 0 ? weighted / totalWeight : null;
}

/**
 * Builds the rows a report card prints, one per subject that has a score.
 *
 * The predicate is derived from the *rounded* score, so the letter always
 * agrees with the number printed beside it.
 */
export function calculateSubjectGrades(
  subjects: SubjectGradeInput[],
): SubjectGradeRow[] {
  const rows: SubjectGradeRow[] = [];

  for (const subject of subjects) {
    const raw = calculateSubjectScore(subject);
    if (raw === null) continue;

    const scoreValue = round2(raw);
    const { predicate, isComplete } = predicateFor(
      scoreValue,
      subject.passingScore,
    );

    rows.push({
      no: rows.length + 1,
      subjectId: subject.subjectId,
      code: subject.subjectCode ?? '',
      name: subject.subjectName,
      score: scoreValue.toFixed(2),
      scoreValue,
      passingScore: subject.passingScore,
      predicate,
      description: PREDICATE_DESCRIPTIONS[predicate],
      isComplete,
    });
  }

  return rows;
}

/**
 * The figure the rank is drawn from: the mean of the subject scores.
 *
 * Not a weighted mean over every assessment in the semester, which is what it
 * used to be — that let a subject with twelve quizzes count for more of a
 * student's standing than one with three, purely because its teacher assessed
 * more often.
 */
export function calculateTotalAverage(rows: SubjectGradeRow[]): number | null {
  if (rows.length === 0) return null;
  const total = rows.reduce((sum, row) => sum + row.scoreValue, 0);
  return round2(total / rows.length);
}
