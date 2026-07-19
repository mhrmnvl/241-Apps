import { Test, TestingModule } from '@nestjs/testing';
import { EducationStatus } from '@prisma/client';
import { CreateEducationalHistoryDto } from '../dto/create-educational-history.dto.js';
import { EducationalHistoryRepository } from '../repositories/educational-history.repository.js';
import { CreateEducationalHistoryUseCase } from './create-educational-history.use-case.js';

describe('CreateEducationalHistoryUseCase', () => {
  let useCase: CreateEducationalHistoryUseCase;

  const mockRepo = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEducationalHistoryUseCase,
        { provide: EducationalHistoryRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateEducationalHistoryUseCase>(
      CreateEducationalHistoryUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateEducationalHistoryDto = {
      profileId: 'profile-uuid',
      level: 'SMA',
      institution: 'SMAN 1 Malang',
      startYear: 2018,
      endYear: 2021,
      status: EducationStatus.GRADUATED,
    };

    it('should create educational history and return result', async () => {
      const created = { id: 'edu-1', ...dto };
      mockRepo.create.mockResolvedValue(created);

      const result = await useCase.execute(dto);

      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });
});
