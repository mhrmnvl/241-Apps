/**
 * The portal's public URL shape lives in `post/constants/post.constants.ts` and
 * is re-exported here so the metadata and sitemap code reads naturally without
 * a second, drifting copy. The frontend router declares the same paths; they
 * have to agree, and the e2e visibility sweep is what notices when they stop.
 */
export {
  POST_TYPE_TO_PUBLIC_PATH,
  PUBLIC_PATH_TO_POST_TYPE,
  postTypeFromPath,
} from '../../post/constants/post.constants.js';

/**
 * The share-preview variant. 1200×630 is what the major platforms crop to, and
 * supplying it directly stops their arbitrary crop cutting heads off a group
 * photo. See `file-upload.constants.ts` for why it is JPEG.
 */
export const PREVIEW_VARIANT = 'preview';

/** Falls back to these when a path resolves to nothing public. */
export const PORTAL_DEFAULT_META = {
  title: 'Portal MTs Persis 241 Al-Ikhlash',
  description:
    'Berita, artikel, agenda, dan informasi resmi MTs Persis 241 Al-Ikhlash.',
} as const;
