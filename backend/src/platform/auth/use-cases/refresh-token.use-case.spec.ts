import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { TokenManagerService } from '../services/token-manager.service.js';
import { RefreshTokenUseCase } from './refresh-token.use-case.js';

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  const mockTokenManagerService = {
    verifyRefreshToken: jest.fn(),
    hashToken: jest.fn(),
    constantTimeEqual: jest.fn(),
    generateTokenPair: jest.fn(),
    getRefreshExpirationMs: jest.fn(),
  };

  const mockAuthRepository = {
    findSessionWithUser: jest.fn(),
    revokeSession: jest.fn(),
    updateSessionToken: jest.fn(),
  };

  const mockSession = {
    id: 'session-uuid-1',
    tokenHash: 'stored-hash',
    revokedAt: null,
    expiresAt: new Date(Date.now() + 86400000),
    user: {
      id: 'user-uuid-1',
      identifier: 'admin',
      isActive: true,
      deletedAt: null,
    },
  };

  const mockPayload = {
    sub: 'user-uuid-1',
    sessionId: 'session-uuid-1',
    username: 'admin',
    role: 'ADMIN',
    type: 'refresh' as const,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenUseCase,
        { provide: TokenManagerService, useValue: mockTokenManagerService },
        { provide: IAuthRepository, useValue: mockAuthRepository },
      ],
    }).compile();

    useCase = module.get<RefreshTokenUseCase>(RefreshTokenUseCase);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should rotate tokens successfully', async () => {
      mockTokenManagerService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockAuthRepository.findSessionWithUser.mockResolvedValue(mockSession);
      mockTokenManagerService.hashToken.mockReturnValue('stored-hash');
      mockTokenManagerService.constantTimeEqual.mockReturnValue(true);
      mockTokenManagerService.generateTokenPair.mockResolvedValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      mockTokenManagerService.getRefreshExpirationMs.mockReturnValue(604800000);
      mockAuthRepository.updateSessionToken.mockResolvedValue({});

      const result = await useCase.execute('old-refresh-token');

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        refreshExpiresInMs: 604800000,
        user: {
          id: mockSession.user.id,
          identifier: mockSession.user.identifier,
          isActive: mockSession.user.isActive,
        },
      });
    });

    it('should update session with new token hash', async () => {
      mockTokenManagerService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockAuthRepository.findSessionWithUser.mockResolvedValue(mockSession);
      mockTokenManagerService.hashToken
        .mockReturnValueOnce('stored-hash')
        .mockReturnValueOnce('new-hashed-refresh');
      mockTokenManagerService.constantTimeEqual.mockReturnValue(true);
      mockTokenManagerService.generateTokenPair.mockResolvedValue({
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      });
      mockTokenManagerService.getRefreshExpirationMs.mockReturnValue(604800000);
      mockAuthRepository.updateSessionToken.mockResolvedValue({});

      await useCase.execute('old-refresh-token');

      expect(mockAuthRepository.updateSessionToken).toHaveBeenCalledWith(
        mockSession.id,
        expect.objectContaining({
          tokenHash: 'new-hashed-refresh',
        }),
      );
    });

    it('should throw UnauthorizedException when token verification fails', async () => {
      mockTokenManagerService.verifyRefreshToken.mockRejectedValue(
        new Error('jwt expired'),
      );

      await expect(useCase.execute('expired-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when session not found', async () => {
      mockTokenManagerService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockAuthRepository.findSessionWithUser.mockResolvedValue(null);

      await expect(useCase.execute('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when session is revoked', async () => {
      mockTokenManagerService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockAuthRepository.findSessionWithUser.mockResolvedValue({
        ...mockSession,
        revokedAt: new Date(),
      });

      await expect(useCase.execute('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when session is expired', async () => {
      mockTokenManagerService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockAuthRepository.findSessionWithUser.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() - 86400000),
      });

      await expect(useCase.execute('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockTokenManagerService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockAuthRepository.findSessionWithUser.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, isActive: false },
      });

      await expect(useCase.execute('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is soft-deleted', async () => {
      mockTokenManagerService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockAuthRepository.findSessionWithUser.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, deletedAt: new Date() },
      });

      await expect(useCase.execute('valid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should revoke session and throw on token reuse detection', async () => {
      mockTokenManagerService.verifyRefreshToken.mockResolvedValue(mockPayload);
      mockAuthRepository.findSessionWithUser.mockResolvedValue(mockSession);
      mockTokenManagerService.hashToken.mockReturnValue('different-hash');
      mockTokenManagerService.constantTimeEqual.mockReturnValue(false);

      await expect(useCase.execute('reused-token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthRepository.revokeSession).toHaveBeenCalledWith(
        mockSession.id,
      );
    });
  });
});
