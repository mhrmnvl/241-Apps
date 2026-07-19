import { Test, TestingModule } from '@nestjs/testing';
import { AuthCleanupService } from './auth-cleanup.service.js';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';

describe('AuthCleanupService', () => {
  let service: AuthCleanupService;

  const mockAuthRepository = {
    deleteExpiredSessions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthCleanupService,
        { provide: IAuthRepository, useValue: mockAuthRepository },
      ],
    }).compile();

    service = module.get<AuthCleanupService>(AuthCleanupService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cleanupExpiredSessions', () => {
    it('should call deleteExpiredSessions with current date and 30-day retention', async () => {
      mockAuthRepository.deleteExpiredSessions.mockResolvedValue({ count: 3 });

      await service.cleanupExpiredSessions();

      expect(mockAuthRepository.deleteExpiredSessions).toHaveBeenCalledWith(
        expect.any(Date),
        30 * 24 * 60 * 60 * 1000,
      );
    });

    it('should not throw when no sessions are cleaned', async () => {
      mockAuthRepository.deleteExpiredSessions.mockResolvedValue({ count: 0 });

      await expect(service.cleanupExpiredSessions()).resolves.toBeUndefined();
    });

    it('should propagate repository errors', async () => {
      mockAuthRepository.deleteExpiredSessions.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(service.cleanupExpiredSessions()).rejects.toThrow(
        'DB error',
      );
    });
  });
});
