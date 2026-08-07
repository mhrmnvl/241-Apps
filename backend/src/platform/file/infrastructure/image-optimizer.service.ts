import { Injectable } from '@nestjs/common';
import sharp from 'sharp';
import {
  IMAGE_OPTIMIZATION_OPTIONS,
  SHARE_PREVIEW_OPTIONS,
} from '../constants/file-upload.constants.js';
import {
  ImageOptimizerService,
  OptimizedImage,
  OptimizeOptions,
} from '../domain/interfaces/image-optimizer.interface.js';

export type { OptimizedImage, OptimizeOptions };

@Injectable()
export class SharpImageOptimizerService implements ImageOptimizerService {
  async optimize(
    buffer: Buffer,
    opts: OptimizeOptions = {},
  ): Promise<OptimizedImage> {
    const maxWidth = opts.maxWidth ?? IMAGE_OPTIMIZATION_OPTIONS.maxWidth;
    const maxHeight = opts.maxHeight ?? IMAGE_OPTIMIZATION_OPTIONS.maxHeight;
    const format = opts.format ?? 'webp';

    // .rotate() with no args bakes in the EXIF orientation before sharp's
    // default output strips all metadata (EXIF/GPS/ICC/IPTC/XMP).
    const pipeline = sharp(buffer).rotate().resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    });

    const optimized = await (
      format === 'png'
        ? pipeline.png()
        : pipeline.webp({
            quality: opts.quality ?? IMAGE_OPTIMIZATION_OPTIONS.quality,
          })
    ).toBuffer();

    return {
      buffer: optimized,
      mimeType: format === 'png' ? 'image/png' : 'image/webp',
      extension: format === 'png' ? '.png' : '.webp',
    };
  }

  async buildSharePreview(buffer: Buffer): Promise<OptimizedImage> {
    const preview = await sharp(buffer)
      .rotate()
      .resize({
        width: SHARE_PREVIEW_OPTIONS.width,
        height: SHARE_PREVIEW_OPTIONS.height,
        // `cover` rather than `inside`: the platforms crop to this ratio
        // regardless, and cropping here at least centres on the subject rather
        // than letting each platform choose its own edge to cut.
        fit: 'cover',
        position: 'attention',
        // Enlarged when the source is smaller: a card with a correctly-sized
        // image beats one the platform pads or refuses.
        withoutEnlargement: false,
      })
      .jpeg({ quality: SHARE_PREVIEW_OPTIONS.quality, mozjpeg: true })
      .toBuffer();

    return {
      buffer: preview,
      mimeType: 'image/jpeg',
      extension: '.jpg',
    };
  }
}
