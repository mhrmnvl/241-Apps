import { Module } from '@nestjs/common';
import { HomepageModule } from './homepage.module.js';
import { PortalHtmlController } from './presentation/portal-html.controller.js';

/**
 * The SPA shell controller, alone in its own module.
 *
 * Its route is `GET *`, and Nest matches controllers in registration order — so
 * anything registered after it never sees a request. Keeping it inside
 * `HomepageModule` made that ordering depend on where `HomepageModule` happened
 * to sit in `PortalModule`'s import list, and moving a line there silently
 * turned `/portal/public/agenda` into a 404.
 *
 * Isolated here and imported last, the ordering requirement is visible at the
 * one place it matters, and `portal-public-visibility.e2e-spec.ts` fails loudly
 * if it is ever violated again.
 */
@Module({
  imports: [HomepageModule],
  controllers: [PortalHtmlController],
})
export class PortalHtmlModule {}
