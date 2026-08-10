import {
  ArgumentsHost,
  Catch,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { HttpExceptionFilter } from '../../../core/filters/http-exception.filter.js';
import { PayrollAuditService } from '../services/payroll-audit.service.js';

/**
 * Records refused access to salary data, then answers exactly as usual.
 *
 * A refusal thrown by the permission guard never reaches a use case, so without
 * this the one event FR-052 most wants reviewable — somebody reaching for a
 * payslip that is not theirs — would be the one event that leaves no trace.
 * Extending the global filter keeps the response envelope identical; the only
 * addition is the audit row.
 */
@Catch(ForbiddenException)
@Injectable()
export class PayrollAccessFilter extends HttpExceptionFilter {
  constructor(
    @InjectPinoLogger(HttpExceptionFilter.name) logger: PinoLogger,
    private readonly audit: PayrollAuditService,
  ) {
    super(logger);
  }

  catch(exception: ForbiddenException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<Request>();
    // Express types a route param as string | string[]; only the scalar form
    // identifies a payslip, and a missing one is a refusal on a list route.
    const target = request.params?.id;

    // Answer first, record after. Nest does not await a filter, so awaiting
    // the audit write here would hold the 403 open for as long as the audit
    // table is slow — the opposite of the granted-read path, where the caller
    // waiting is the point. The service swallows its own failures.
    super.catch(exception, host);

    void this.audit.record(
      'payroll.payslip.denied',
      request.user?.id ?? null,
      typeof target === 'string' ? target : null,
      { path: request.originalUrl || request.url, method: request.method },
    );
  }
}
