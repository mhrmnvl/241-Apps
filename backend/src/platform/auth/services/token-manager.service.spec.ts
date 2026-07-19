import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenManagerService } from './token-manager.service.js';

describe('TokenManagerService', () => {
  let service: TokenManagerService;

  const testConfig: Record<string, string> = {
    JWT_SECRET: 'test-secret-key',
    JWT_ACCESS_EXPIRATION: '15m',
    JWT_REFRESH_EXPIRATION: '7d',
  };
  const mockConfigService = {
    get: jest.fn(
      (key: string, defaultVal?: string) => testConfig[key] ?? defaultVal,
    ),
    getOrThrow: jest.fn((key: string) => {
      const value = testConfig[key];
      if (value === undefined) {
        throw new Error(`Missing config: ${key}`);
      }
      return value;
    }),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenManagerService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<TokenManagerService>(TokenManagerService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateTokenPair', () => {
    const mockUser = {
      id: 'user-uuid-1',
      identifier: 'admin',
    };
    const sessionId = 'session-uuid-1';

    it('should generate access and refresh tokens', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('mock-access-token')
        .mockResolvedValueOnce('mock-refresh-token');

      const result = await service.generateTokenPair(mockUser, sessionId);

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
    });

    it('should sign access token with type "access"', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.generateTokenPair(mockUser, sessionId);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          sessionId,
          identifier: mockUser.identifier,
          type: 'access',
        }),
        expect.objectContaining({
          secret: 'test-secret-key',
          expiresIn: '15m',
        }),
      );
    });

    it('should sign refresh token with type "refresh"', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      await service.generateTokenPair(mockUser, sessionId);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          sessionId,
          identifier: mockUser.identifier,
          type: 'refresh',
        }),
        expect.objectContaining({
          secret: 'test-secret-key',
          expiresIn: '7d',
        }),
      );
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return payload for valid refresh token', async () => {
      const expectedPayload = {
        sub: 'user-uuid-1',
        sessionId: 'session-uuid-1',
        identifier: 'admin',
        type: 'refresh',
      };
      mockJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      const result = await service.verifyRefreshToken('valid-token');

      expect(result).toEqual(expectedPayload);
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
        secret: 'test-secret-key',
      });
    });

    it('should throw UnauthorizedException when token type is not "refresh"', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        sub: 'user-uuid-1',
        sessionId: 'session-uuid-1',
        type: 'access',
      });

      await expect(service.verifyRefreshToken('access-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should propagate JWT verification errors', async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(service.verifyRefreshToken('expired-token')).rejects.toThrow(
        'jwt expired',
      );
    });

    it('should trim whitespace from token', async () => {
      const payload = {
        sub: 'user-uuid-1',
        sessionId: 'session-uuid-1',
        type: 'refresh',
        username: 'admin',
        role: 'ADMIN',
      };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      await service.verifyRefreshToken('  valid-token  ');

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-token',
        expect.any(Object),
      );
    });

    it('should strip surrounding quotes from token', async () => {
      const payload = {
        sub: 'user-uuid-1',
        sessionId: 'session-uuid-1',
        type: 'refresh',
        username: 'admin',
        role: 'ADMIN',
      };
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      await service.verifyRefreshToken('"valid-token"');

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-token',
        expect.any(Object),
      );
    });
  });

  describe('hashToken', () => {
    it('should return a SHA-256 hex hash', () => {
      const hash = service.hashToken('test-token');

      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('should produce deterministic output', () => {
      const hash1 = service.hashToken('same-token');
      const hash2 = service.hashToken('same-token');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different input', () => {
      const hash1 = service.hashToken('token-a');
      const hash2 = service.hashToken('token-b');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('constantTimeEqual', () => {
    it('should return true for identical strings', () => {
      expect(service.constantTimeEqual('abc', 'abc')).toBe(true);
    });

    it('should return false for different strings of same length', () => {
      expect(service.constantTimeEqual('abc', 'def')).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      expect(service.constantTimeEqual('short', 'longer-string')).toBe(false);
    });
  });

  describe('getRefreshExpirationMs', () => {
    it('should parse "7d" as 7 days in ms', () => {
      const result = service.getRefreshExpirationMs();

      expect(result).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('should parse "30m" correctly', () => {
      mockConfigService.get.mockReturnValue('30m');

      const result = service.getRefreshExpirationMs();

      expect(result).toBe(30 * 60 * 1000);
    });

    it('should parse "2h" correctly', () => {
      mockConfigService.get.mockReturnValue('2h');

      const result = service.getRefreshExpirationMs();

      expect(result).toBe(2 * 60 * 60 * 1000);
    });

    it('should parse "60s" correctly', () => {
      mockConfigService.get.mockReturnValue('60s');

      const result = service.getRefreshExpirationMs();

      expect(result).toBe(60 * 1000);
    });

    it('should default to 7 days for invalid format', () => {
      mockConfigService.get.mockReturnValue('invalid');

      const result = service.getRefreshExpirationMs();

      expect(result).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });
});
