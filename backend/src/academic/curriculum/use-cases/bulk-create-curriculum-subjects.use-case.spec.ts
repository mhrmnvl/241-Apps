import { Test, TestingModule } from '@nestjs/testing';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { BulkCreateCurriculumSubjectDto } from '../dto/request/bulk-create-curriculum-subject.dto.js';
import { BulkCreateCurriculumSubjectsUseCase } from './bulk-create-curriculum-subjects.use-case.js';

describe('BulkCreateCurriculumSubjectsUseCase', () => {
  let useCase: BulkCreateCurriculumSubjectsUseCase;

  const mockRepository = {
    findDuplicate: jest.fn(),
    findSoftDeleted: jest.fn(),
    restore: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BulkCreateCurriculumSubjectsUseCase,
        { provide: ICurriculumSubjectRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<BulkCreateCurriculumSubjectsUseCase>(
      BulkCreateCurriculumSubjectsUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: BulkCreateCurriculumSubjectDto = {
      items: [
        { curriculumId: 'cur-1', subjectId: 'sub-1', hoursPerWeek: 2 },
        { curriculumId: 'cur-1', subjectId: 'sub-2' },
      ],
    };

    it('should create all items when no duplicates or soft-deleted records exist', async () => {
      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.findSoftDeleted.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({});

      const result = await useCase.execute(dto);

      expect(result).toEqual({ created: 2, skipped: 0 });
      expect(mockRepository.create).toHaveBeenCalledTimes(2);
      expect(mockRepository.create).toHaveBeenCalledWith({
        curriculumId: 'cur-1',
        subjectId: 'sub-1',
        hoursPerWeek: 2,
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        curriculumId: 'cur-1',
        subjectId: 'sub-2',
        hoursPerWeek: undefined,
      });
    });

    it('should skip items that already have an active duplicate', async () => {
      mockRepository.findDuplicate
        .mockResolvedValueOnce({ id: 'existing-1' }) // sub-1 is duplicate
        .mockResolvedValueOnce(null); // sub-2 is new
      mockRepository.findSoftDeleted.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({});

      const result = await useCase.execute(dto);

      expect(result).toEqual({ created: 1, skipped: 1 });
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ subjectId: 'sub-2' }),
      );
    });

    it('should restore soft-deleted records instead of creating new ones', async () => {
      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.findSoftDeleted
        .mockResolvedValueOnce({ id: 'soft-1' }) // sub-1 was soft-deleted
        .mockResolvedValueOnce(null); // sub-2 is brand new
      mockRepository.restore.mockResolvedValue({});
      mockRepository.create.mockResolvedValue({});

      const result = await useCase.execute(dto);

      expect(result).toEqual({ created: 2, skipped: 0 });
      expect(mockRepository.restore).toHaveBeenCalledTimes(1);
      expect(mockRepository.restore).toHaveBeenCalledWith('soft-1', {
        hoursPerWeek: 2,
      });
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should skip all items when all are duplicates', async () => {
      mockRepository.findDuplicate.mockResolvedValue({ id: 'existing' });

      const result = await useCase.execute(dto);

      expect(result).toEqual({ created: 0, skipped: 2 });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.restore).not.toHaveBeenCalled();
    });

    it('should return zero created and skipped for an empty items array', async () => {
      const emptyDto: BulkCreateCurriculumSubjectDto = { items: [] };

      const result = await useCase.execute(emptyDto);

      expect(result).toEqual({ created: 0, skipped: 0 });
      expect(mockRepository.findDuplicate).not.toHaveBeenCalled();
    });

    it('should process items sequentially and handle mixed results', async () => {
      const mixedDto: BulkCreateCurriculumSubjectDto = {
        items: [
          { curriculumId: 'cur-1', subjectId: 'sub-1' }, // new
          { curriculumId: 'cur-1', subjectId: 'sub-2' }, // duplicate
          { curriculumId: 'cur-1', subjectId: 'sub-3' }, // restore
        ],
      };

      mockRepository.findDuplicate
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'dup' })
        .mockResolvedValueOnce(null);
      mockRepository.findSoftDeleted
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'soft-3' });
      mockRepository.create.mockResolvedValue({});
      mockRepository.restore.mockResolvedValue({});

      const result = await useCase.execute(mixedDto);

      expect(result).toEqual({ created: 2, skipped: 1 });
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.restore).toHaveBeenCalledTimes(1);
    });
  });
});
