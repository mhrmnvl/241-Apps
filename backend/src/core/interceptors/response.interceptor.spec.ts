import { CallHandler, ExecutionContext, StreamableFile } from '@nestjs/common';
import { of } from 'rxjs';
import {
  ResponseEnvelope,
  ResponseInterceptor,
} from './response.interceptor.js';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
  });

  const createMockContext = (statusCode = 200): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ statusCode }),
      }),
    }) as unknown as ExecutionContext;

  const createMockHandler = (data: unknown): CallHandler => ({
    handle: () => of(data),
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap plain data in envelope', (done) => {
    const context = createMockContext(200);
    const handler = createMockHandler({ id: 1, name: 'Test' });

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        data: { id: 1, name: 'Test' },
      });
      done();
    });
  });

  it('should auto-reshape paginated repo payload { data, total, page, limit } into { data, meta }', (done) => {
    const context = createMockContext(200);
    const handler = createMockHandler({
      data: [{ id: 1 }, { id: 2 }],
      total: 50,
      page: 1,
      limit: 10,
    });

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        data: [{ id: 1 }, { id: 2 }],
        meta: { total: 50, page: 1, limit: 10 },
      });
      done();
    });
  });

  it('should preserve existing envelope with data+meta', (done) => {
    const context = createMockContext(200);
    const envelopeData = {
      message: 'Custom message',
      data: [{ id: 1 }],
      meta: { total: 1, page: 1 },
    };
    const handler = createMockHandler(envelopeData);

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Custom message',
        data: [{ id: 1 }],
        meta: { total: 1, page: 1 },
      });
      done();
    });
  });

  it('should default message to "Success" when envelope has no message', (done) => {
    const context = createMockContext(201);
    const handler = createMockHandler({ data: { id: 1 }, meta: {} });

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 201,
        message: 'Success',
        data: { id: 1 },
        meta: {},
      });
      done();
    });
  });

  it('should wrap null data in envelope', (done) => {
    const context = createMockContext(200);
    const handler = createMockHandler(null);

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        data: null,
      });
      done();
    });
  });

  it('should wrap string data in envelope', (done) => {
    const context = createMockContext(200);
    const handler = createMockHandler('hello');

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toEqual({
        statusCode: 200,
        message: 'Success',
        data: 'hello',
      });
      done();
    });
  });

  it('should use correct statusCode from response', (done) => {
    const context = createMockContext(201);
    const handler = createMockHandler({ id: 1 });

    interceptor.intercept(context, handler).subscribe((result) => {
      const envelope = result as ResponseEnvelope<unknown>;
      expect(envelope.statusCode).toBe(201);
      done();
    });
  });

  it('should pass StreamableFile through without wrapping', (done) => {
    const buffer = Buffer.from('fake xlsx content');
    const streamableFile = new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="test.xlsx"',
    });
    const context = createMockContext(200);
    const handler = createMockHandler(streamableFile);

    interceptor.intercept(context, handler).subscribe((result) => {
      expect(result).toBe(streamableFile);
      expect(result).toBeInstanceOf(StreamableFile);
      done();
    });
  });
});
