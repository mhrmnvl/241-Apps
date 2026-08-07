import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IPostRepository } from '../domain/interfaces/post-repository.interface.js';

/**
 * Relabels SCHEDULED rows whose moment has passed as PUBLISHED.
 *
 * **This job is cosmetic, and nothing public depends on it running.**
 *
 * Public visibility is derived at read time from `publishedAt`, not from
 * `status` — `post.where.ts` admits both SCHEDULED and PUBLISHED and then
 * compares the timestamp. An item scheduled for 07:00 is therefore public at
 * 07:00 whether this job ran at 06:59, at 07:05, or never. Its only effect is
 * that the management list stops saying "Terjadwal" for something that is
 * already out (research R1).
 *
 * That is deliberate and worth stating loudly: a scheduled-publish feature whose
 * correctness depends on a cron is one where a missed tick means the school's
 * announcement silently fails to appear. Here a missed tick means a stale label
 * in an admin table, and the next tick fixes it.
 *
 * Consequences of that design worth knowing:
 * - Safe to run on several instances: `updateMany` is idempotent, and a row
 *   already relabelled no longer matches the filter.
 * - Safe to not run at all. Disabling it degrades a label, not the site.
 * - It must never be the place where publishing logic lives. Anything that
 *   belongs in `PublishPostUseCase` and drifts here becomes conditional on a
 *   cron, which is exactly the failure mode this design avoids.
 */
@Injectable()
export class PostStatusSyncService {
  private readonly logger = new Logger(PostStatusSyncService.name);

  constructor(private readonly postRepository: IPostRepository) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async normalizeDueScheduled(): Promise<void> {
    try {
      const count = await this.postRepository.normalizeDueScheduled();
      if (count > 0) {
        this.logger.log(
          `Relabelled ${count} due scheduled post(s) as published`,
        );
      }
    } catch (error) {
      // A failure here costs a stale label until the next minute. It must not
      // take the process down, and it is not worth waking anyone for.
      this.logger.warn(
        `Status normalisation skipped: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
