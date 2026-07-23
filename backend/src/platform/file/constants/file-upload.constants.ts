export const ALLOWED_UPLOAD_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const;

// GIF is excluded: sharp only reads the first frame unless given {animated:
// true}, which would silently flatten any animated GIF during optimization.
export const OPTIMIZABLE_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const IMAGE_OPTIMIZATION_OPTIONS = {
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 80,
} as const;
