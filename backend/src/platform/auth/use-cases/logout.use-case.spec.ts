import { Test, TestingModule } from '@nestjs/testing';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { LogoutUseCase } from './logout.use-case.js';

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  const mockAuthRepository = {
    revokeSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUseCase,
        { provide: IAuthRepository, useValue: mockAuthRepository },
      ],
    }).compile();

    useCase = module.get<LogoutUseCase>(LogoutUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should revoke session by sessionId', async () => {
      mockAuthRepository.revokeSession.mockResolvedValue({});
      await useCase.execute('session-uuid-1');
      expect(mockAuthRepository.revokeSession).toHaveBeenCalledWith(
        'session-uuid-1',
      );
    });

    it('should not throw when revokeSession succeeds', async () => {
      mockAuthRepository.revokeSession.mockResolvedValue({});
      await expect(useCase.execute('session-uuid-1')).resolves.toBeUndefined();
    });

    it('should propagate repository errors', async () => {
      mockAuthRepository.revokeSession.mockRejectedValue(new Error('DB error'));
      await expect(useCase.execute('session-uuid-1')).rejects.toThrow(
        'DB error',
      );
    });
  });
});
