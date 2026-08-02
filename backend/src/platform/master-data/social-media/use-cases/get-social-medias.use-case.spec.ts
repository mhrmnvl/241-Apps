import { Test, TestingModule } from '@nestjs/testing';
import { SocialMediaQueryDto } from '../dto/request/social-media-query.dto.js';
import { ISocialMediaRepository } from '../domain/interfaces/social-media-repository.interface.js';
import { GetSocialMediasUseCase } from './get-social-medias.use-case.js';

describe('GetSocialMediasUseCase', () => {
  let useCase: GetSocialMediasUseCase;

  const mockRepo = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSocialMediasUseCase,
        { provide: ISocialMediaRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetSocialMediasUseCase>(GetSocialMediasUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: SocialMediaQueryDto = { page: 1, limit: 10 };

    it('should return paginated platforms with correct meta', async () => {
      const mockData = [
        { id: 'plt-1', name: 'Instagram' },
        { id: 'plt-2', name: 'Facebook' },
      ];
      mockRepo.findAll.mockResolvedValue({
        data: mockData,
        total: 2,
      });

      const result = await useCase.execute(query);

      // The query contract is passed straight through; the repo does the paging.
      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockData,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
    });

    it('should calculate totalPages correctly', async () => {
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 25,
      });

      const result = await useCase.execute(query);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should return empty data when no platforms exist', async () => {
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await useCase.execute(query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });
  });
});
