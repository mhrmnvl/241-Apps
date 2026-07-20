import { Test, TestingModule } from '@nestjs/testing';
import { ReportCardQueryDto } from '../dto/request/report-card-query.dto.js';
import { IReportCardRepository } from '../domain/interfaces/report-card-repository.interface.js';
import { GetReportCardsUseCase } from './get-report-cards.use-case.js';

describe('GetReportCardsUseCase', () => {
  let useCase: GetReportCardsUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetReportCardsUseCase,
        { provide: IReportCardRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetReportCardsUseCase>(GetReportCardsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return repository result', async () => {
      const query: ReportCardQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 'rap-1' }],
        total: 1,
        page: 1,
        limit: 10,
      };
      mockRepo.findAll.mockResolvedValue(expected);

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });
});
