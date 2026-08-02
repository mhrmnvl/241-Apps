import { Test, TestingModule } from '@nestjs/testing';
import { AchievementQueryDto } from '../dto/request/achievement-query.dto.js';
import { IAchievementRepository } from '../domain/interfaces/achievement-repository.interface.js';
import { GetAchievementsUseCase } from './get-achievements.use-case.js';

describe('GetAchievementsUseCase', () => {
  let useCase: GetAchievementsUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAchievementsUseCase,
        { provide: IAchievementRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetAchievementsUseCase>(GetAchievementsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated achievements', async () => {
      const query: AchievementQueryDto = {
        profileId: 'p-1',
        page: 1,
        limit: 20,
      };
      const expected = { data: [{ id: 'a-1' }], total: 1, page: 1, limit: 20 };
      mockRepo.findAll.mockResolvedValue(expected);

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });

    it('should pass typeId filter correctly', async () => {
      const query: AchievementQueryDto = { typeId: 'achievement-type-uuid' };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      });

      await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
    });
  });
});
