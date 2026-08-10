import { Module } from '@nestjs/common';
import { AttendancePeriodModule } from './attendance-period/attendance-period.module.js';
import { CredentialModule } from './credential/credential.module.js';
import { DailyRecordModule } from './daily-record/daily-record.module.js';
import { DeviceModule } from './device/device.module.js';
import { LeaveModule } from './leave/leave.module.js';
import { ScanModule } from './scan/scan.module.js';
import { PresenceSharedModule } from './shared/presence-shared.module.js';
import { WorkPatternModule } from './work-pattern/work-pattern.module.js';

/**
 * Gate presence for students and employees alike.
 *
 * Every model in this domain keys on `userId` rather than on `Student` or
 * `Teacher`, which is what keeps it free of any dependency on `academic/` —
 * `academic/attendance` reads *from* here, never the reverse (ADR-0007).
 *
 * `DailyRecordModule` is exported because `academic/attendance` consumes its
 * read port to pre-fill a class from the gate, and `payroll/` will consume the
 * monthly summary.
 */
@Module({
  imports: [
    PresenceSharedModule,
    AttendancePeriodModule,
    WorkPatternModule,
    CredentialModule,
    DailyRecordModule,
    DeviceModule,
    ScanModule,
    LeaveModule,
  ],
  exports: [AttendancePeriodModule, DailyRecordModule],
})
export class PresenceModule {}
