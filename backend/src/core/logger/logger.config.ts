import type { IncomingMessage } from 'http';
import type { Params } from 'nestjs-pino';

export const pinoLoggerConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',

    genReqId: (req) =>
      (req.headers['x-request-id'] as string | undefined) ??
      crypto.randomUUID(),

    customLogLevel: (_req, res) => {
      if (res.statusCode >= 400) return 'silent';
      return 'info';
    },

    customProps: (req: IncomingMessage) => {
      const props: Record<string, unknown> = {};
      // The auth guard attaches `user`; nothing else off the request is read
      // here, so narrow to that instead of asserting the full Express type.
      const { user } = req as IncomingMessage & { user?: { id: string } };
      if (user) {
        props.userId = user.id;
      }
      return props;
    },

    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
              ignore: 'pid,hostname',
            },
          }
        : undefined,

    serializers: {
      req: (raw: Record<string, unknown>) => {
        const req = raw as {
          id: unknown;
          method: string;
          url: string;
          raw?: { originalUrl?: string; params?: Record<string, string> };
        };

        const serialized: Record<string, unknown> = {
          id: req.id,
          method: req.method,
          url: req.raw?.originalUrl ?? req.url,
        };

        const params = req.raw?.params;
        if (params && typeof params === 'object') {
          const resolved = Object.fromEntries(
            Object.entries(params).filter(
              ([, v]) =>
                typeof v === 'string' && v.length > 0 && !v.startsWith(':'),
            ),
          );
          if (Object.keys(resolved).length > 0) {
            serialized.params = resolved;
          }
        }

        return serialized;
      },
      res: (raw: Record<string, unknown>) => ({
        statusCode: (raw as { statusCode: number }).statusCode,
      }),
    },

    ...(process.env.NODE_ENV === 'production' && {
      formatters: {
        level: (label: string) => ({ level: label }),
      },
      base: { application: 'siakad-api' },
    }),

    autoLogging: {
      ignore: (req) => req.url === '/health',
    },
  },

  renameContext: 'context',
};
