import {
  BeforeApplicationShutdown,
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const ADDRESS_OWNER_FIELDS = [
  'studentId',
  'teacherId',
  'parentId',
  'institutionId',
] as const;

function assertAddressHasOwner(data: Record<string, unknown>): void {
  const hasOwner = ADDRESS_OWNER_FIELDS.some((field) => data[field] != null);
  if (!hasOwner) {
    throw new InternalServerErrorException(
      'Address must belong to at least one owner (student, teacher, parent, or institution).',
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
      ssl: {
        rejectUnauthorized: false,
      },
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
