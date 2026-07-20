import { Test, TestingModule } from '@nestjs/testing';
import { UserQueryDto } from '../dto/request/user-query.dto.js';
import { IUserRepository } from '../interfaces/user-repository.interface.js';
import { GetUsersUseCase } from './get-users.use-case.js';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUsersUseCase,
        { provide: IUserRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetUsersUseCase>(GetUsersUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated users with correct meta', async () => {
      const query: UserQueryDto = { page: 1, limit: 10 };
      mockRepo.findAll.mockResolvedValue({
        data: [{ id: '1', username: 'admin' }],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(mockRepo.findAll).toHaveBeenCalledWith(query);
      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should calculate totalPages correctly', async () => {
      const query: UserQueryDto = { page: 1, limit: 10 };
      mockRepo.findAll.mockResolvedValue({
        data: [],
        total: 25,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.meta.totalPages).toBe(3);
    });
  });
});
