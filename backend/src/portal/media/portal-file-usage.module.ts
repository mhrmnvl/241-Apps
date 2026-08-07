import { Global, Module } from '@nestjs/common';
import { IFileUsageChecker } from '../../platform/file/domain/interfaces/file-usage-checker.interface.js';
import { PortalFileUsageChecker } from './infrastructure/portal-file-usage.checker.js';
import { MediaModule } from './media.module.js';

/**
 * Registers the portal's implementation of `platform/file`'s usage-check port.
 *
 * `@Global()` is what lets `DeleteFileUseCase` resolve the checker without
 * `FileModule` importing anything from `portal/` — which it must not do, since
 * platform is the supplier and portal the consumer (Constitution II). This is
 * the standard inversion: the abstraction lives with the consumer of the
 * abstraction, the implementation with the module that knows the answer.
 *
 * Kept as its own module rather than putting `@Global()` on MediaModule, so the
 * global surface is exactly one provider and it is obvious why it is global.
 */
@Global()
@Module({
  imports: [MediaModule],
  providers: [{ provide: IFileUsageChecker, useClass: PortalFileUsageChecker }],
  exports: [IFileUsageChecker],
})
export class PortalFileUsageModule {}
