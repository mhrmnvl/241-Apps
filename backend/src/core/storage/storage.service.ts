import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly uploadDir: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Saves a file buffer to the local uploads directory and returns its public URL.
   * @param fileBuffer The buffer of the file.
   * @param filePath The destination path inside the uploads dir (e.g. 'avatars/user-123.png').
   * @param _mimeType The MIME type of the file (unused for local storage).
   */
  async uploadFile(
    fileBuffer: Buffer,
    filePath: string,
    _mimeType: string,
  ): Promise<string> {
    const destination = path.join(this.uploadDir, filePath);
    const dir = path.dirname(destination);

    try {
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(destination, fileBuffer);
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
    return this.getPublicUrl(filePath);
  }

  /**
   * Deletes a file from the local uploads directory by its path.
   * @param filePath The path of the file to delete (e.g. 'avatars/user-123.png').
   */
  async deleteFile(filePath: string): Promise<void> {
    const destination = path.join(this.uploadDir, filePath);

    try {
      await fs.promises.rm(destination, { force: true });
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
   * Generates and returns the public URL for a given file path.
   * @param filePath The path inside the uploads directory.
   */
  getPublicUrl(filePath: string): string {
    const baseUrl = this.configService.get<string>('FRONTEND_URL');
    return `${baseUrl}/uploads/${filePath}`;
  }
}
