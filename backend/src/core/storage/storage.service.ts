import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly signedUrlExpirySeconds: number;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET')!;
    this.signedUrlExpirySeconds = this.configService.get<number>(
      'S3_SIGNED_URL_EXPIRY_SECONDS',
    )!;

    this.client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      region: this.configService.get<string>('S3_REGION'),
      // MinIO (and most self-hosted S3-compatible servers) need path-style
      // addressing (endpoint/bucket/key), not AWS's virtual-hosted style.
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>(
          'S3_SECRET_ACCESS_KEY',
        )!,
      },
    });
  }

  /**
   * Uploads a file buffer to the bucket and returns its storage key. The
   * bucket is private, so this does NOT return a usable URL — call
   * getSignedUrl() to get one, generated fresh at read time.
   */
  async uploadFile(
    fileBuffer: Buffer,
    filePath: string,
    mimeType: string,
  ): Promise<string> {
    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: filePath,
          Body: fileBuffer,
          ContentType: mimeType,
        }),
      );
    } catch (err) {
      this.logger.error(
        `Failed to upload file to ${filePath}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Failed to upload file: ${String(err)}`,
      );
    }

    this.logger.log(`Uploaded file successfully: ${filePath}`);
    return filePath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: filePath }),
      );
    } catch (err) {
      this.logger.error(
        `Failed to delete file from ${filePath}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException(
        `Failed to delete file: ${String(err)}`,
      );
    }

    this.logger.log(`Deleted file successfully: ${filePath}`);
  }

  /**
   * Generates a time-limited signed URL for downloading a private object.
   * Callers must not cache this beyond the configured expiry.
   */
  async getSignedUrl(filePath: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });
    return getSignedUrl(this.client, command, {
      expiresIn: this.signedUrlExpirySeconds,
    });
  }
}
