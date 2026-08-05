import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateSubjectDto } from '../dto/request/update-subject.dto.js';
import { ISubjectRepository } from '../domain/interfaces/subject-repository.interface.js';
import { UpdateSubjectUseCase } from './update-subject.use-case.js';

describe('UpdateSubjectUseCase', () => {
  let useCase: UpdateSubjectUseCase;

  const mockRepo = {
    findById: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSubjectUseCase,
        { provide: ISubjectRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateSubjectUseCase>(UpdateSubjectUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'sub-1';
    const currentSubject = { id: 'sub-1', name: 'Mathematics' };

    it('should update a subject successfully (no name change)', async () => {
      const dto: UpdateSubjectDto = { code: 'MTK' };
      const updated = { ...currentSubject, code: 'MTK' };
      mockRepo.findById.mockResolvedValue(currentSubject);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.findByName).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should update name when name changes and is unique', async () => {
      const dto: UpdateSubjectDto = { name: 'Advanced Mathematics' };
      const updated = { id: 'sub-1', name: 'Advanced Mathematics' };
      mockRepo.findById.mockResolvedValue(currentSubject);
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findByName).toHaveBeenCalledWith('Advanced Mathematics');
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should NOT throw if findByName returns the same subject (same id)', async () => {
      const dto: UpdateSubjectDto = { name: 'Mathematics' };
      mockRepo.findById.mockResolvedValue(currentSubject);
      mockRepo.findByName.mockResolvedValue({
        id: 'sub-1',
        name: 'Mathematics',
      });
      mockRepo.update.mockResolvedValue(currentSubject);

      await expect(useCase.execute(id, dto)).resolves.toBeDefined();
      expect(mockRepo.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when subject is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, { name: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new name is taken by another subject', async () => {
      const dto: UpdateSubjectDto = { name: 'Physics' };
      mockRepo.findById.mockResolvedValue(currentSubject);
      mockRepo.findByName.mockResolvedValue({
        id: 'sub-other',
        name: 'Physics',
      });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should NOT call findByName when name is absent from dto', async () => {
      const dto: UpdateSubjectDto = { code: 'IPA' };
      mockRepo.findById.mockResolvedValue(currentSubject);
      mockRepo.update.mockResolvedValue(currentSubject);

      await useCase.execute(id, dto);

      expect(mockRepo.findByName).not.toHaveBeenCalled();
    });
  });
});
