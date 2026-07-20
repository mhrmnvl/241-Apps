import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateScholarshipDto } from '../dto/request/update-scholarship.dto.js';
import { ScholarshipRepository } from '../repositories/scholarship.repository.js';
import { UpdateScholarshipUseCase } from './update-scholarship.use-case.js';

describe('UpdateScholarshipUseCase', () => {
  let useCase: UpdateScholarshipUseCase;

  const mockRepo = { findById: jest.fn(), update: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateScholarshipUseCase,
        { provide: ScholarshipRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateScholarshipUseCase>(UpdateScholarshipUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'sch-uuid';
    const dto: UpdateScholarshipDto = { name: 'Updated' };

    it('should update and return scholarship', async () => {
      mockRepo.findById.mockResolvedValue({ id });
      mockRepo.update.mockResolvedValue({ id, ...dto });

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual({ id, ...dto });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
