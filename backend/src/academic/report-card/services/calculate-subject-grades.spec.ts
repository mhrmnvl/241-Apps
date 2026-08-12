import { AssessmentType } from '@prisma/client';
import {
  calculateSubjectGrades,
  calculateSubjectScore,
  calculateTotalAverage,
  predicateFor,
  type ScoredAssessment,
  type SubjectGradeInput,
} from './calculate-subject-grades.js';

function assessment(
  type: AssessmentType,
  score: number,
  maxScore = 100,
  itemWeight = 1,
): ScoredAssessment {
  return { type, score, maxScore, itemWeight };
}

function subject(
  overrides: Partial<SubjectGradeInput> = {},
): SubjectGradeInput {
  return {
    subjectId: 'sub-1',
    subjectCode: 'MTK',
    subjectName: 'Matematika',
    passingScore: 75,
    typeWeights: { DAILY: 40, MIDTERM: 30, FINAL: 30 },
    assessments: [],
    ...overrides,
  };
}

describe('predicateFor', () => {
  // The whole point of deriving the scale: the D/C boundary is the passing score, so a
  // student can never be "Cukup" and not yet passed at the same time.
  it.each([
    [75, 100, 'A'],
    [75, 91.67, 'A'],
    [75, 91.66, 'B'],
    [75, 83.34, 'B'],
    [75, 83.33, 'C'],
    [75, 75, 'C'],
    [75, 74.99, 'D'],
    [75, 0, 'D'],
  ])(
    'passing score %s: a score of %s is %s',
    (passingScore, score, expected) => {
      expect(predicateFor(score, passingScore).predicate).toBe(expected);
    },
  );

  it('moves every band when the passing score moves', () => {
    expect(predicateFor(85, 70).predicate).toBe('B');
    expect(predicateFor(85, 80).predicate).toBe('C');
  });

  it('marks anything below the passing score as not yet passed', () => {
    expect(predicateFor(74.99, 75).isComplete).toBe(false);
    expect(predicateFor(75, 75).isComplete).toBe(true);
  });

  it('treats a passing score of 100 as leaving only the top band', () => {
    expect(predicateFor(100, 100)).toEqual({
      predicate: 'A',
      isComplete: true,
    });
    expect(predicateFor(99, 100)).toEqual({
      predicate: 'D',
      isComplete: false,
    });
  });

  it('clamps a passing score outside 0-100 rather than inverting the scale', () => {
    expect(predicateFor(50, -10).isComplete).toBe(true);
    expect(predicateFor(50, 150).isComplete).toBe(false);
  });
});

describe('calculateSubjectScore', () => {
  // The bug this rewrite exists for: 20 out of 25 is 80%, not 20.
  it('expresses each assessment as a percentage of its own maximum', () => {
    const score = calculateSubjectScore(
      subject({
        typeWeights: { DAILY: 100 },
        assessments: [
          assessment('DAILY', 20, 25),
          assessment('DAILY', 80, 100),
        ],
      }),
    );

    expect(score).toBe(80);
  });

  it('weights the types against each other', () => {
    const score = calculateSubjectScore(
      subject({
        assessments: [
          assessment('DAILY', 80),
          assessment('MIDTERM', 60),
          assessment('FINAL', 90),
        ],
      }),
    );

    // 80×0.4 + 60×0.3 + 90×0.3 = 77
    expect(score).toBe(77);
  });

  // Adding a quiz must not shift how much daily work counts overall.
  it('keeps a type at its weight however many assessments it holds', () => {
    const three = calculateSubjectScore(
      subject({
        assessments: [
          assessment('DAILY', 80),
          assessment('DAILY', 80),
          assessment('DAILY', 80),
          assessment('MIDTERM', 60),
          assessment('FINAL', 90),
        ],
      }),
    );

    expect(three).toBe(77);
  });

  it('lets item weight rank assessments inside one type', () => {
    const score = calculateSubjectScore(
      subject({
        typeWeights: { DAILY: 100 },
        assessments: [
          assessment('DAILY', 90, 100, 2),
          assessment('DAILY', 60, 100, 1),
        ],
      }),
    );

    // (90×2 + 60×1) / 3 = 80
    expect(score).toBe(80);
  });

  // A report card pulled in October must not score students against a final
  // exam that happens in December.
  it('renormalises over the types that have been assessed so far', () => {
    const score = calculateSubjectScore(
      subject({
        assessments: [assessment('DAILY', 80), assessment('MIDTERM', 90)],
      }),
    );

    // 80×(40/70) + 90×(30/70) = 84.28…, not 80×0.4 + 90×0.3 = 59
    expect(score).toBeCloseTo(84.29, 2);
  });

  it('ignores a type the teacher gave no weight', () => {
    const score = calculateSubjectScore(
      subject({
        typeWeights: { DAILY: 100, PRACTICAL: 0 },
        assessments: [assessment('DAILY', 80), assessment('PRACTICAL', 10)],
      }),
    );

    expect(score).toBe(80);
  });

  it('has no score before anything is graded', () => {
    expect(calculateSubjectScore(subject({ assessments: [] }))).toBeNull();
  });

  it('has no score when every weight is zero', () => {
    expect(
      calculateSubjectScore(
        subject({
          typeWeights: { DAILY: 0 },
          assessments: [assessment('DAILY', 80)],
        }),
      ),
    ).toBeNull();
  });

  it('skips an assessment with a non-positive maximum instead of dividing by it', () => {
    const score = calculateSubjectScore(
      subject({
        typeWeights: { DAILY: 100 },
        assessments: [assessment('DAILY', 10, 0), assessment('DAILY', 70, 100)],
      }),
    );

    expect(score).toBe(70);
  });
});

describe('calculateSubjectGrades', () => {
  it('numbers the rows and formats the score for print', () => {
    const [row] = calculateSubjectGrades([
      subject({
        typeWeights: { DAILY: 100 },
        assessments: [assessment('DAILY', 80), assessment('DAILY', 85)],
      }),
    ]);

    expect(row).toMatchObject({
      no: 1,
      code: 'MTK',
      name: 'Matematika',
      score: '82.50',
      scoreValue: 82.5,
      passingScore: 75,
      predicate: 'C',
      description: 'Cukup',
      isComplete: true,
    });
  });

  // The letter is read off the number the reader can see, so a score printed
  // as 75.00 is never labelled as failing.
  it('derives the predicate from the rounded score', () => {
    const [row] = calculateSubjectGrades([
      subject({
        passingScore: 75,
        typeWeights: { DAILY: 100 },
        assessments: [assessment('DAILY', 74.999, 100)],
      }),
    ]);

    expect(row?.score).toBe('75.00');
    expect(row?.isComplete).toBe(true);
  });

  it('leaves out a subject that has nothing graded', () => {
    const rows = calculateSubjectGrades([
      subject({ subjectId: 'sub-1', assessments: [assessment('DAILY', 80)] }),
      subject({ subjectId: 'sub-2', assessments: [] }),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.subjectId).toBe('sub-1');
    expect(rows[0]?.no).toBe(1);
  });

  it('carries the passing score each subject was judged against', () => {
    const rows = calculateSubjectGrades([
      subject({
        subjectId: 'sub-1',
        passingScore: 70,
        typeWeights: { DAILY: 100 },
        assessments: [assessment('DAILY', 72)],
      }),
      subject({
        subjectId: 'sub-2',
        passingScore: 80,
        typeWeights: { DAILY: 100 },
        assessments: [assessment('DAILY', 72)],
      }),
    ]);

    expect(rows[0]).toMatchObject({ passingScore: 70, isComplete: true });
    expect(rows[1]).toMatchObject({ passingScore: 80, isComplete: false });
  });

  it('returns nothing for a student with no scores at all', () => {
    expect(calculateSubjectGrades([])).toEqual([]);
  });
});

describe('calculateTotalAverage', () => {
  // A subject assessed twelve times must not outweigh one assessed three
  // times when the class is ranked.
  it('averages the subjects, not the assessments', () => {
    const rows = calculateSubjectGrades([
      subject({
        subjectId: 'sub-1',
        typeWeights: { DAILY: 100 },
        assessments: Array.from({ length: 12 }, () => assessment('DAILY', 60)),
      }),
      subject({
        subjectId: 'sub-2',
        typeWeights: { DAILY: 100 },
        assessments: [assessment('DAILY', 90)],
      }),
    ]);

    expect(calculateTotalAverage(rows)).toBe(75);
  });

  it('has no average without a graded subject', () => {
    expect(calculateTotalAverage([])).toBeNull();
  });
});
