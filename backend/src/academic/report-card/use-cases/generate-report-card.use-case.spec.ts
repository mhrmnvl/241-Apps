import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICurriculumSubjectRepository } from '../../curriculum/domain/interfaces/curriculum-subject-repository.interface.js';
import { IEnrollmentRepository } from '../../enrollment/domain/interfaces/enrollment-repository.interface.js';
import { IStudentScoreRepository } from '../../assessment/domain/interfaces/student-score-repository.interface.js';
import { GenerateReportCardDto } from '../dto/request/generate-report-card.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { GenerateReportCardUseCase } from './generate-report-card.use-case.js';

/** A scored assessment as the repository hands it over, joined to its subject. */
function scoreRow(options: {
  score: number | null;
  type?: string;
  weight?: number;
  maxScore?: number;
  subjectId?: string;
  subjectName?: string;
  gradeId?: string;
  assignmentPassingScore?: number | null;
  typeWeights?: { type: string; weight: number }[];
}) {
  return {
    score: options.score,
    assessmentItem: {
      type: options.type ?? 'DAILY',
      weight: options.weight ?? 1,
      maxScore: options.maxScore ?? 100,
      teachingAssignment: {
        id: 'ta-1',
        passingScore: options.assignmentPassingScore ?? null,
        subject: {
          id: options.subjectId ?? 'subj-1',
          name: options.subjectName ?? 'Matematika',
          code: 'MTK',
        },
        classroom: {
          gradeId: options.gradeId ?? 'grade-7',
          academicYearId: 'ay-1',
        },
        assessmentWeights: options.typeWeights ?? [
          { type: 'DAILY', weight: 100 },
        ],
      },
    },
  };
}

describe('GenerateReportCardUseCase', () => {
  let useCase: GenerateReportCardUseCase;

  const mockRepo = {
    upsert: jest.fn(),
    findByEnrollmentId: jest.fn(),
    calculateAndApplyClassroomRanks: jest.fn(),
  };
  const mockScoreRepository = { findAllForReportCard: jest.fn() };
  const mockEnrollmentRepository = { findById: jest.fn() };
  const mockCurriculumSubjectRepository = { findPassingScores: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateReportCardUseCase,
        { provide: IReportCardRepository, useValue: mockRepo },
        { provide: IStudentScoreRepository, useValue: mockScoreRepository },
        { provide: IEnrollmentRepository, useValue: mockEnrollmentRepository },
        {
          provide: ICurriculumSubjectRepository,
          useValue: mockCurriculumSubjectRepository,
        },
      ],
    }).compile();

    useCase = module.get<GenerateReportCardUseCase>(GenerateReportCardUseCase);
    jest.clearAllMocks();

    mockEnrollmentRepository.findById.mockResolvedValue({ id: 'enr-1' });
    mockRepo.findByEnrollmentId.mockResolvedValue(null);
    mockCurriculumSubjectRepository.findPassingScores.mockResolvedValue([]);
    mockRepo.upsert.mockImplementation((input: unknown) =>
      Promise.resolve({ id: 'rap-1', ...(input as object) }),
    );
  });

  const dto: GenerateReportCardDto = { enrollmentId: 'enr-1' };

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('scores each assessment against its own maximum', async () => {
      mockScoreRepository.findAllForReportCard.mockResolvedValue([
        scoreRow({ score: 20, maxScore: 25 }),
        scoreRow({ score: 80, maxScore: 100 }),
      ]);

      await useCase.execute(dto);

      // Both are 80%, so the subject is 80 — not (20+80)/2.
      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ totalAverage: 80 }),
      );
    });

    it('applies the teacher per-type weights', async () => {
      const typeWeights = [
        { type: 'DAILY', weight: 40 },
        { type: 'MIDTERM', weight: 30 },
        { type: 'FINAL', weight: 30 },
      ];
      mockScoreRepository.findAllForReportCard.mockResolvedValue([
        scoreRow({ score: 80, type: 'DAILY', typeWeights }),
        scoreRow({ score: 60, type: 'MIDTERM', typeWeights }),
        scoreRow({ score: 90, type: 'FINAL', typeWeights }),
      ]);

      await useCase.execute(dto);

      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ totalAverage: 77 }),
      );
    });

    it('averages the subjects rather than every assessment', async () => {
      mockScoreRepository.findAllForReportCard.mockResolvedValue([
        scoreRow({ score: 60, subjectId: 'subj-1', subjectName: 'MTK' }),
        scoreRow({ score: 60, subjectId: 'subj-1', subjectName: 'MTK' }),
        scoreRow({ score: 60, subjectId: 'subj-1', subjectName: 'MTK' }),
        scoreRow({ score: 90, subjectId: 'subj-2', subjectName: 'IPA' }),
      ]);

      await useCase.execute(dto);

      // Two subjects at 60 and 90 → 75, however lopsided the assessment counts.
      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ totalAverage: 75 }),
      );
    });

    it('stores a line per subject with the passing score it was judged against', async () => {
      mockScoreRepository.findAllForReportCard.mockResolvedValue([
        scoreRow({ score: 72, subjectId: 'subj-1' }),
        scoreRow({
          score: 72,
          subjectId: 'subj-2',
          subjectName: 'IPA',
          assignmentPassingScore: 80,
        }),
      ]);
      mockCurriculumSubjectRepository.findPassingScores.mockResolvedValue([
        {
          gradeId: 'grade-7',
          academicYearId: 'ay-1',
          subjectId: 'subj-1',
          passingScore: 70,
        },
      ]);

      await useCase.execute(dto);

      const { subjects } = mockRepo.upsert.mock.calls[0][0];
      expect(subjects).toEqual([
        expect.objectContaining({
          subjectId: 'subj-1',
          passingScore: 70,
          isComplete: true,
        }),
        expect.objectContaining({
          subjectId: 'subj-2',
          passingScore: 80,
          isComplete: false,
        }),
      ]);
    });

    it('ignores an assessment that has not been marked', async () => {
      mockScoreRepository.findAllForReportCard.mockResolvedValue([
        scoreRow({ score: null }),
        scoreRow({ score: 90 }),
      ]);

      await useCase.execute(dto);

      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ totalAverage: 90 }),
      );
    });

    it('should handle empty scores with null average', async () => {
      mockScoreRepository.findAllForReportCard.mockResolvedValue([]);

      const result = await useCase.execute(dto);

      expect(mockRepo.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ totalAverage: null, subjects: [] }),
      );
      expect(result.totalAverage).toBeNull();
    });

    // A published card is a document a parent already holds.
    it('refuses to regenerate a published report card', async () => {
      mockRepo.findByEnrollmentId.mockResolvedValue({
        id: 'rap-1',
        isPublished: true,
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.upsert).not.toHaveBeenCalled();
    });

    it('regenerates one that is still a draft', async () => {
      mockRepo.findByEnrollmentId.mockResolvedValue({
        id: 'rap-1',
        isPublished: false,
      });
      mockScoreRepository.findAllForReportCard.mockResolvedValue([
        scoreRow({ score: 90 }),
      ]);

      await expect(useCase.execute(dto)).resolves.toBeDefined();
      expect(mockRepo.upsert).toHaveBeenCalled();
    });

    it('should throw NotFoundException when enrollment not found', async () => {
      mockEnrollmentRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
    });
  });
});
