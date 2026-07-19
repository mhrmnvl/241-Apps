import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCurriculumSubjectDto } from '../dto/create-curriculum-subject.dto.js';
import { ICurriculumSubjectRepository } from '../domain/interfaces/curriculum-subject-repository.interface.js';
import { CreateCurriculumSubjectUseCase } from './create-curriculum-subject.use-case.js';

describe('CreateCurriculumSubjectUseCase', () => {
  let useCase: CreateCurriculumSubjectUseCase;

  const mockRepository = {
    findDuplicate: jest.fn(),
    findSoftDeleted: jest.fn(),
    restore: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCurriculumSubjectUseCase,
        { provide: ICurriculumSubjectRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateCurriculumSubjectUseCase>(
      CreateCurriculumSubjectUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateCurriculumSubjectDto = {
      curriculumId: 'cur-1',
      classroomLevelId: 'lvl-7',
      subjectId: 'sub-1',
      hoursPerWeek: 4,
    };

    it('should create successfully', async () => {
      const created = { id: 'cs-1', ...dto };
      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.findSoftDeleted.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(created);

      const result = await useCase.execute(dto);

      expect(mockRepository.findDuplicate).toHaveBeenCalledWith(
        dto.curriculumId,
        dto.classroomLevelId,
        dto.subjectId,
      );
      expect(mockRepository.create).toHaveBeenCalledWith({
        curriculumId: dto.curriculumId,
        gradeId: dto.classroomLevelId,
        subjectId: dto.subjectId,
        hoursPerWeek: dto.hoursPerWeek,
      });
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when duplicate exists', async () => {
      mockRepository.findDuplicate.mockResolvedValue({ id: 'existing' });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should restore soft-deleted record instead of creating new', async () => {
      const softDeleted = { id: 'cs-old' };
      const restored = { id: 'cs-old', ...dto };
      mockRepository.findDuplicate.mockResolvedValue(null);
      mockRepository.findSoftDeleted.mockResolvedValue(softDeleted);
      mockRepository.restore.mockResolvedValue(restored);

      const result = await useCase.execute(dto);

      expect(mockRepository.restore).toHaveBeenCalledWith('cs-old', {
        hoursPerWeek: dto.hoursPerWeek,
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(restored);
    });
  });
});
