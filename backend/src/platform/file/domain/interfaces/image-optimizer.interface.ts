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

  /**
   * The 1200×630 JPEG a link-preview crawler is given.
   *
   * Separate from `optimize` because it is not an optimization: it crops to a
   * fixed aspect ratio and encodes to a different format on purpose. See
   * SHARE_PREVIEW_OPTIONS for why each of those is what it is.
   */
  abstract buildSharePreview(buffer: Buffer): Promise<OptimizedImage>;
}
