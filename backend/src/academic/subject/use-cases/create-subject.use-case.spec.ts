import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateSubjectDto } from '../dto/request/create-subject.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';
import { CreateSubjectUseCase } from './create-subject.use-case.js';

describe('CreateSubjectUseCase', () => {
  let useCase: CreateSubjectUseCase;

  const mockRepo = {
    findByName: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSubjectUseCase,
        { provide: ISubjectRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateSubjectUseCase>(CreateSubjectUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateSubjectDto = { name: 'Mathematics' };

    it('should create a subject successfully', async () => {
      const created = { id: 'sub-1', name: 'Mathematics' };
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(created);

      const result = await useCase.execute(dto);

      expect(mockRepo.findByName).toHaveBeenCalledWith('Mathematics');
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('should create a subject with teacherIds', async () => {
      const dtoWithTeachers: CreateSubjectDto = {
        name: 'Physics',
        teacherIds: ['emp-1', 'emp-2'],
      };
      const created = { id: 'sub-2', name: 'Physics' };
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(created);

      const result = await useCase.execute(dtoWithTeachers);

      expect(mockRepo.create).toHaveBeenCalledWith(dtoWithTeachers);
      expect(result).toEqual(created);
    });

    it('should throw ConflictException when subject name already exists', async () => {
      mockRepo.findByName.mockResolvedValue({
        id: 'sub-existing',
        name: 'Mathematics',
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
