import {
  BadRequestException,
  BeforeApplicationShutdown,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { pgSslOptions } from './pg-ssl.js';

const ADDRESS_OWNER_FIELDS = [
  'studentId',
  'teacherId',
  'parentId',
  'schoolUnitId',
] as const;

function assertAddressHasOwner(data: Record<string, unknown>): void {
  const hasOwner = ADDRESS_OWNER_FIELDS.some((field) => data[field] != null);
  if (!hasOwner) {
    // A missing owner is a caller/data problem, not a server fault — throw a 4xx
    // so the message reaches the client instead of being masked as a 500.
    throw new BadRequestException(
      'Address must belong to an owner (student, teacher, parent, or school unit).',
    );
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown
{
  private readonly logger = new Logger(PrismaService.name);
  private isDisconnected = false;

  constructor(private readonly configService: ConfigService) {
    const connectionString =
      configService.get<string>('DATABASE_URL') ??
      configService.get<string>('DIRECT_URL');
    const adapter = new PrismaPg({
      connectionString,
      ...pgSslOptions(connectionString),
    });
    super({ adapter });

    return this.$extends({
      query: {
        address: {
          create({ args, query }) {
            assertAddressHasOwner(args.data);
            return query(args);
          },
          createMany({ args, query }) {
            const rows = Array.isArray(args.data) ? args.data : [args.data];
            rows.forEach((row) => assertAddressHasOwner(row));
            return query(args);
          },
        },
      },
    }) as this;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.disconnect('onModuleDestroy');
  }

  async beforeApplicationShutdown(signal?: string) {
    await this.disconnect(`beforeApplicationShutdown:${signal}`);
  }

  private async disconnect(context: string) {
    if (this.isDisconnected) {
      return;
    }
    this.isDisconnected = true;
    this.logger.log(`Disconnecting Prisma client (${context})`);
    await this.$disconnect();
  }
}
