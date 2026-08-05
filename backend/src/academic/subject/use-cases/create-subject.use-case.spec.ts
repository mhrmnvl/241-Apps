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

    // Teachers are bound to a (classroom, semester) pair, so creating a
    // subject must never assign one. Guards the old behaviour, which fanned a
    // single teacher out across every classroom.
    it('should not forward any teacher field to the repository', async () => {
      const dto: CreateSubjectDto = { name: 'Physics', code: 'FIS' };
      const created = { id: 'sub-2', name: 'Physics' };
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(created);

      await useCase.execute(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.not.objectContaining({ teacherIds: expect.anything() }),
      );
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
