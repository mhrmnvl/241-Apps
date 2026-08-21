import { Module } from '@nestjs/common';
import { AcademicSettingModule } from '../academic-setting/academic-setting.module.js';
import { StudentModule } from '../student/student.module.js';
import { TeacherModule } from '../teacher/teacher.module.js';
import { IMyDashboardRepository } from './domain/interfaces/my-dashboard-repository.interface.js';
import { PrismaMyDashboardRepository } from './infrastructure/persistence/prisma-my-dashboard.repository.js';
import { MyDashboardController } from './presentation/my-dashboard.controller.js';
import { GetMyDashboardUseCase } from './use-cases/get-my-dashboard.use-case.js';

/**
 * The personal dashboard lives in `academic/` rather than beside the
 * institution one in `platform/`.
 *
 * Everything it reports — enrolment, timetable, attendance, marks, teaching
 * load — is academic. Assembling it in platform would have platform depending
 * on academic, which is the wrong way round for the package every app builds
 * on. The two share the `/dashboards` prefix and nothing else.
 */
@Module({
  imports: [
    // For the identity ports: the caller is resolved to their own student and
    // teacher records rather than to a role name.
    StudentModule,
    TeacherModule,
    // For the weekly-holiday rule, so an empty timetable can say why.
    AcademicSettingModule,
  ],
  controllers: [MyDashboardController],
  providers: [
    {
      provide: IMyDashboardRepository,
      useClass: PrismaMyDashboardRepository,
    },
    GetMyDashboardUseCase,
  ],
})
export class MyDashboardModule {}
