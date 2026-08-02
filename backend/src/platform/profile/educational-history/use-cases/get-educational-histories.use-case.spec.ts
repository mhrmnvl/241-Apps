import { Test, TestingModule } from '@nestjs/testing';
import { EducationStatus } from '../../../../shared/domain/enums/education-status.enum.js';
import { EducationalHistoryQueryDto } from '../dto/request/educational-history-query.dto.js';
import { IEducationalHistoryRepository } from '../domain/interfaces/educational-history-repository.interface.js';
import { GetEducationalHistoriesUseCase } from './get-educational-histories.use-case.js';

describe('GetEducationalHistoriesUseCase', () => {
  let useCase: GetEducationalHistoriesUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEducationalHistoriesUseCase,
        { provide: IEducationalHistoryRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetEducationalHistoriesUseCase>(
      GetEducationalHistoriesUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated educational histories', async () => {
      const query: EducationalHistoryQueryDto = {
        profileId: 'p-1',
        page: 1,
        limit: 50,
      };
      const expected = {
        data: [{ id: 'edu-1' }],
        total: 1,
        page: 1,
        limit: 50,
      };
      mockRepo.findAll.mockResolvedValue(expected);

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('should pass status enum filter', async () => {
      const query: EducationalHistoryQueryDto = {
        status: EducationStatus.GRADUATED,
      };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
    });
  });
});
