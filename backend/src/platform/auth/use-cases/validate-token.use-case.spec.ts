import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAuthRepository } from '../domain/interfaces/auth-repository.interface.js';
import { ValidateTokenUseCase } from './validate-token.use-case.js';
import type { JwtTokenPayload } from '../types/jwt-token-payload.type.js';

describe('ValidateTokenUseCase', () => {
  let useCase: ValidateTokenUseCase;

  const mockAuthRepository = {
    findSessionWithUser: jest.fn(),
  };

  const validPayload: JwtTokenPayload = {
    sub: 'user-uuid-1',
    sessionId: 'session-uuid-1',
    identifier: 'admin',
    type: 'access',
  };

  const mockSession = {
    id: 'session-uuid-1',
    revokedAt: null,
    expiresAt: new Date(Date.now() + 86400000),
    user: {
      id: 'user-uuid-1',
      identifier: 'admin',
      isActive: true,
      deletedAt: null,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateTokenUseCase,
        { provide: IAuthRepository, useValue: mockAuthRepository },
      ],
    }).compile();

    useCase = module.get<ValidateTokenUseCase>(ValidateTokenUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return user data for valid access token', async () => {
      mockAuthRepository.findSessionWithUser.mockResolvedValue(mockSession);

      const result = await useCase.execute(validPayload);

      expect(result).toEqual({
        id: mockSession.user.id,
        identifier: mockSession.user.identifier,
        isActive: mockSession.user.isActive,
        sessionId: mockSession.id,
        sub: mockSession.user.id,
      });
    });

    it('should throw UnauthorizedException for non-access token type', async () => {
      const refreshPayload: JwtTokenPayload = {
        ...validPayload,
        type: 'refresh',
      };

      await expect(useCase.execute(refreshPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuthRepository.findSessionWithUser).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when session not found', async () => {
      mockAuthRepository.findSessionWithUser.mockResolvedValue(null);

      await expect(useCase.execute(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when session is revoked', async () => {
      mockAuthRepository.findSessionWithUser.mockResolvedValue({
        ...mockSession,
        revokedAt: new Date(),
      });

      await expect(useCase.execute(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when session is expired', async () => {
      mockAuthRepository.findSessionWithUser.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() - 86400000),
      });

      await expect(useCase.execute(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockAuthRepository.findSessionWithUser.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, isActive: false },
      });

      await expect(useCase.execute(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is soft-deleted', async () => {
      mockAuthRepository.findSessionWithUser.mockResolvedValue({
        ...mockSession,
        user: { ...mockSession.user, deletedAt: new Date() },
      });

      await expect(useCase.execute(validPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
