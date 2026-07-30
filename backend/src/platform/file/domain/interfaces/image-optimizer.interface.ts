export interface OptimizedImage {
  buffer: Buffer;
  mimeType: string;
  extension: string;
}

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'png';
  quality?: number;
}

export abstract class ImageOptimizerService {
  abstract optimize(
    buffer: Buffer,
    opts?: OptimizeOptions,
  ): Promise<OptimizedImage>;
}
