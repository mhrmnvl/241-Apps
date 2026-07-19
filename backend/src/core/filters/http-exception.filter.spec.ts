import {
  ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from './http-exception.filter.js';

type ExtendedHost = ArgumentsHost & {
  _mockStatus: jest.Mock;
  _mockJson: jest.Mock;
};

const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
};

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;

  const createMockHost = (
    overrides: Record<string, unknown> = {},
  ): ArgumentsHost => {
    const mockJson = jest.fn();
    const mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    const mockRequest = {
      method: 'GET',
      originalUrl: '/api/test',
      url: '/api/test',
      _startTime: Date.now() - 50,
      ...overrides,
    };

    return {
      switchToHttp: () => ({
        getResponse: () => ({ status: mockStatus }),
        getRequest: () => mockRequest,
      }),
      _mockStatus: mockStatus,
      _mockJson: mockJson,
    } as unknown as ExtendedHost;
  };

  beforeEach(() => {
    filter = new HttpExceptionFilter(mockLogger as unknown as PinoLogger);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('HttpException handling', () => {
    it('should handle 400 BadRequestException', () => {
      const exception = new BadRequestException('Validation failed');
      const host = createMockHost();

      filter.catch(exception, host);

      const mockStatus = (host as ExtendedHost)._mockStatus;
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockLogger.warn).toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle 404 NotFoundException', () => {
      const exception = new NotFoundException('Resource not found');
      const host = createMockHost();

      filter.catch(exception, host);

      const mockStatus = (host as ExtendedHost)._mockStatus;
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle 500 InternalServerErrorException with error log', () => {
      const exception = new InternalServerErrorException('Server error');
      const host = createMockHost();

      filter.catch(exception, host);

      const mockStatus = (host as ExtendedHost)._mockStatus;
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should mask 5xx error messages as "Internal server error"', () => {
      const exception = new InternalServerErrorException('Secret DB error');
      const host = createMockHost();

      filter.catch(exception, host);

      const mockJson = (host as ExtendedHost)._mockJson;
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
        }),
      );
    });

    it('should handle validation errors with message array', () => {
      const exception = new BadRequestException({
        message: ['field1 is required', 'field2 must be a string'],
      });
      const host = createMockHost();

      filter.catch(exception, host);

      const mockJson = (host as ExtendedHost)._mockJson;
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: ['field1 is required', 'field2 must be a string'],
        }),
      );
    });
  });

  describe('unknown exception handling', () => {
    it('should handle unknown errors as 500', () => {
      const exception = new Error('Something unexpected');
      const host = createMockHost();

      filter.catch(exception, host);

      const mockStatus = (host as ExtendedHost)._mockStatus;
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle non-Error thrown values', () => {
      const host = createMockHost();

      filter.catch('string error', host);

      const mockStatus = (host as ExtendedHost)._mockStatus;
      expect(mockStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('favicon.ico suppression', () => {
    it('should not log for /favicon.ico requests', () => {
      const exception = new NotFoundException();
      const host = createMockHost({ originalUrl: '/favicon.ico' });

      filter.catch(exception, host);

      expect(mockLogger.warn).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  describe('response format', () => {
    it('should always include statusCode, message, and data: null', () => {
      const exception = new BadRequestException('Bad input');
      const host = createMockHost();

      filter.catch(exception, host);

      const mockJson = (host as ExtendedHost)._mockJson;
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          data: null,
        }),
      );
    });
  });
});
