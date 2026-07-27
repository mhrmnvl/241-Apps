export interface SubjectScoreInput {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  score: number;
}

export interface SubjectGradeRow {
  no: number;
  code: string;
  name: string;
  score: string;
  predicate: string;
  description: string;
}

function determinePredicate(avg: number): {
  predicate: string;
  description: string;
} {
  if (avg >= 90) return { predicate: 'A', description: 'Sangat Baik' };
  if (avg >= 80) return { predicate: 'B', description: 'Baik' };
  if (avg >= 70) return { predicate: 'C', description: 'Cukup' };
  return { predicate: 'D', description: 'Kurang' };
}

/** Groups scores by subject, averages them, and assigns an A-D predicate. */
export function calculateSubjectGrades(
  scores: SubjectScoreInput[],
): SubjectGradeRow[] {
  const subjectGradesMap = new Map<
    string,
    { subjectName: string; subjectCode: string; scoresList: number[] }
  >();

  for (const s of scores) {
    const existing = subjectGradesMap.get(s.subjectId);
    if (existing) {
      existing.scoresList.push(s.score);
    } else {
      subjectGradesMap.set(s.subjectId, {
        subjectName: s.subjectName,
        subjectCode: s.subjectCode,
        scoresList: [s.score],
      });
    }
  }

  return Array.from(subjectGradesMap.values()).map((subj, index) => {
    const avg =
      subj.scoresList.reduce((sum, val) => sum + val, 0) /
      subj.scoresList.length;
    const { predicate, description } = determinePredicate(avg);

    return {
      no: index + 1,
      code: subj.subjectCode,
      name: subj.subjectName,
      score: avg.toFixed(2),
      predicate,
      description,
    };
  });
}
