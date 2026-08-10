import { Injectable } from '@nestjs/common';
import { IDailyPresenceReadPort } from '../../../presence/daily-record/domain/interfaces/daily-presence-read.port.js';
import { EffectiveAssignment } from '../../assignment/domain/interfaces/salary-assignment-repository.interface.js';
import {
  ComposedPayslip,
  PayslipLineEntity,
} from '../domain/entities/payslip.entity.js';
import { AttendanceDriverService } from './attendance-driver.service.js';
import { RoundingService } from './rounding.service.js';
import { SalaryResolverService } from './salary-resolver.service.js';

export interface CompositionResult {
  payslips: ComposedPayslip[];
  /** Roster members with no salary assignment in force — never paid zero. */
  unconfigured: string[];
}

/**
 * Turns a roster plus a month into the payslips a run will write.
 *
 * Shared by creating a run and recalculating one, because those two must
 * produce identical figures from identical inputs — a second implementation is
 * how a recalculation starts quietly disagreeing with the original.
 */
@Injectable()
export class PayslipComposerService {
  constructor(
    private readonly resolver: SalaryResolverService,
    private readonly presence: IDailyPresenceReadPort,
    private readonly drivers: AttendanceDriverService,
    private readonly rounding: RoundingService,
  ) {}

  async compose(
    userIds: string[],
    year: number,
    month: number,
  ): Promise<CompositionResult> {
    const byUser = await this.resolver.resolve(userIds, year, month);
    const unconfigured = this.resolver.unconfigured(byUser);
    if (unconfigured.length > 0) return { payslips: [], unconfigured };

    const summaries = await this.presence.summariseMonth(userIds, year, month);
    const byUserSummary = new Map(summaries.map((s) => [s.userId, s]));

    const payslips = userIds.map((userId) => {
      // A month with no attendance rows at all still gets a defensible figure
      // rather than a blank or a crash (FR-054).
      const summary = byUserSummary.get(userId) ?? this.drivers.blank(userId);
      const lines = (byUser.get(userId) ?? []).map((assignment) =>
        this.line(assignment, summary),
      );
      const { gross, deductions, net } = this.rounding.total(lines);
      const { userId: _identity, ...attendance } = summary;

      return { userId, gross, deductions, net, attendance, lines };
    });

    return { payslips, unconfigured: [] };
  }

  private line(
    assignment: EffectiveAssignment,
    summary: ReturnType<AttendanceDriverService['blank']>,
  ): PayslipLineEntity {
    // The driver decides fixed vs counted; the type decides the sign. A
    // deduction per absent day is both a DEDUCTION and driven, so reading
    // "driven" off the type alone would add absences to someone's pay.
    const driver = assignment.driver;
    const driverCount = driver ? this.drivers.countFor(driver, summary) : null;

    return {
      componentId: assignment.componentId,
      componentCode: assignment.componentCode,
      componentName: assignment.componentName,
      componentType: assignment.componentType,
      amount: driver
        ? this.rounding.driven(assignment.rate, driverCount ?? 0)
        : this.rounding.toRupiah(assignment.amount ?? 0),
      driver,
      driverCount,
      rate: driver ? assignment.rate : null,
    };
  }
}
