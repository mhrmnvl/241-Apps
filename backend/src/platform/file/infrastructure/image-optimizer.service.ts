import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import { IMAGE_OPTIMIZATION_OPTIONS } from '../constants/file-upload.constants.js';

export interface OptimizedImage {
  buffer: Buffer;
  mimeType: string;
  extension: string;
}

@Injectable()
export class ImageOptimizerService {
  async optimize(buffer: Buffer): Promise<OptimizedImage> {
    // .rotate() with no args bakes in the EXIF orientation before sharp's
    // default output strips all metadata (EXIF/GPS/ICC/IPTC/XMP).
    const optimized = await sharp(buffer)
      .rotate()
      .resize({
        width: IMAGE_OPTIMIZATION_OPTIONS.maxWidth,
        height: IMAGE_OPTIMIZATION_OPTIONS.maxHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: IMAGE_OPTIMIZATION_OPTIONS.quality })
      .toBuffer();

    return {
      buffer: optimized,
      mimeType: 'image/webp',
      extension: '.webp',
    };
  }
}
