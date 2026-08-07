import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';

const KEY_PREFIX = 'portal:public:';

/**
 * Response cache for the anonymous portal surface (research R9).
 *
 * **Invalidation is a full flush of the portal namespace, on purpose.**
 *
 * Precise invalidation here would mean working out, for one published article,
 * that it affects its own detail page, its type's listing, every category and
 * tag listing it belongs to, the homepage, the sitemap, and the related lists
 * of every other article in its category. That set is large, easy to get wrong,
 * and wrong in the way that matters most — a stale public page after someone
 * pressed publish, which reads as "the CMS is broken".
 *
 * A flush costs one cold render of a handful of pages on a site with a
 * three-figure item count. That is the right trade.
 *
 * Keys are tracked in a local Set rather than scanned from the store, because
 * the store is swappable (in-memory today, Redis plausibly later) and key
 * enumeration is not part of the cache-manager contract.
 */
@Injectable()
export class PortalCacheService {
  private readonly logger = new Logger(PortalCacheService.name);

  /** Bounded by the store's own `max`; entries are removed as they are flushed. */
  private readonly keys = new Set<string>();

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(KEY_PREFIX + key) ?? undefined;
  }

  async set(key: string, value: unknown, ttlMs?: number): Promise<void> {
    const namespaced = KEY_PREFIX + key;
    await this.cache.set(namespaced, value, ttlMs);
    this.keys.add(namespaced);
  }

  /**
   * Called after any write that could change what a visitor sees: publish,
   * unpublish, archive, pin, delete, restore, and an update of something
   * already published.
   *
   * Failures are swallowed. A cache that cannot be cleared serves stale content
   * for at most one TTL; an exception here would fail the publish itself, which
   * is a far worse outcome for something that already succeeded.
   */
  async invalidate(): Promise<void> {
    const keys = [...this.keys];
    this.keys.clear();

    try {
      await Promise.all(keys.map((key) => this.cache.del(key)));
    } catch (error) {
      this.logger.warn(
        `Portal cache flush failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
