import { calculateSubjectGrades } from './calculate-subject-grades.js';

describe('calculateSubjectGrades', () => {
  it('returns an empty array when there are no scores', () => {
    expect(calculateSubjectGrades([])).toEqual([]);
  });

  it('groups multiple scores of the same subject and averages them', () => {
    const result = calculateSubjectGrades([
      {
        subjectId: 'sub-1',
        subjectName: 'Matematika',
        subjectCode: 'MTK',
        score: 80,
      },
      {
        subjectId: 'sub-1',
        subjectName: 'Matematika',
        subjectCode: 'MTK',
        score: 100,
      },
    ]);

    expect(result).toEqual([
      {
        no: 1,
        code: 'MTK',
        name: 'Matematika',
        score: '90.00',
        predicate: 'A',
        description: 'Sangat Baik',
      },
    ]);
  });

  it('numbers rows sequentially per distinct subject, in first-seen order', () => {
    const result = calculateSubjectGrades([
      {
        subjectId: 'sub-1',
        subjectName: 'Matematika',
        subjectCode: 'MTK',
        score: 80,
      },
      {
        subjectId: 'sub-2',
        subjectName: 'Bahasa Indonesia',
        subjectCode: 'BIN',
        score: 80,
      },
    ]);

    expect(result.map((r) => [r.no, r.code])).toEqual([
      [1, 'MTK'],
      [2, 'BIN'],
    ]);
  });

  it.each([
    [95, 'A', 'Sangat Baik'],
    [90, 'A', 'Sangat Baik'],
    [89, 'B', 'Baik'],
    [80, 'B', 'Baik'],
    [79, 'C', 'Cukup'],
    [70, 'C', 'Cukup'],
    [69, 'D', 'Kurang'],
    [0, 'D', 'Kurang'],
  ])(
    'maps an average of %s to predicate %s (%s)',
    (score, predicate, description) => {
      const [row] = calculateSubjectGrades([
        {
          subjectId: 'sub-1',
          subjectName: 'Matematika',
          subjectCode: 'MTK',
          score,
        },
      ]);

      expect(row?.predicate).toBe(predicate);
      expect(row?.description).toBe(description);
    },
  );
});
