import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppKey } from '@prisma/client';

/**
 * Builds storage keys as `{env}/{app}/{...segments}/{filename}`. S3/MinIO
 * have no real directories — a "folder" is just the literal key prefix —
 * but keeping the hierarchy construction in one place means every upload
 * use case produces the same structure instead of inventing its own ad hoc
 * prefix, which is what makes browsing the bucket traceable.
 */
@Injectable()
export class StorageKeyBuilder {
  constructor(private readonly configService: ConfigService) {}

  private get envSegment(): string {
    return this.configService.get<string>('NODE_ENV') === 'production'
      ? 'production'
      : 'dev';
  }

  /**
   * @param app Uses the Prisma AppKey enum so every module shares one
   * app-identity vocabulary instead of each feature inventing its own.
   * @param segments Module/category path parts, e.g. ['settings', 'branding']
   * or ['documents', 'Kartu Keluarga'].
   * @param filename The final path segment (the actual object name).
   */
  build(app: AppKey, segments: string[], filename: string): string {
    return [this.envSegment, app.toLowerCase(), ...segments, filename].join(
      '/',
    );
  }
}
