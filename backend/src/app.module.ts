import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppConfigModule } from './core/config/config.module.js';
import { PrismaModule } from './core/database/prisma.module.js';
import { StorageModule } from './core/storage/storage.module.js';
import { HttpExceptionFilter } from './core/filters/http-exception.filter.js';
import { HealthModule } from './core/health/health.module.js';
import { ResponseInterceptor } from './core/interceptors/response.interceptor.js';
import { pinoLoggerConfig } from './core/logger/logger.config.js';
import { EventsModule } from './core/events/events.module.js';
import { AppCacheModule } from './core/cache/cache.module.js';
import { AcademicYearModule } from './academic/academic-year/academic-year.module.js';
import { AchievementModule } from './platform/profile/achievement/achievement.module.js';
import { AnnouncementModule } from './platform/announcement/announcement.module.js';
import { AttendanceModule } from './academic/attendance/attendance.module.js';
import { AuthModule } from './platform/auth/auth.module.js';
import { ClassroomModule } from './academic/classroom/classroom.module.js';
import { DashboardModule } from './platform/dashboard/dashboard.module.js';
import { CurriculumModule } from './academic/curriculum/curriculum.module.js';
import { AssessmentModule } from './academic/assessment/assessment.module.js';
import { CalendarModule } from './academic/calendar/calendar.module.js';
import { EducationModule } from './platform/master-data/education/education.module.js';
import { EducationalHistoryModule } from './platform/profile/educational-history/educational-history.module.js';
import { TeacherModule } from './academic/teacher/teacher.module.js';
import { SchoolUnitModule } from './platform/school-unit/school-unit.module.js';
import { OccupationModule } from './academic/master-data/occupation/occupation.module.js';
import { ParentModule } from './academic/parent/parent.module.js';
import { SocialMediaModule } from './platform/master-data/social-media/social-media.module.js';
import { PositionModule } from './academic/master-data/position/position.module.js';
import { EmploymentTypeModule } from './academic/master-data/employment-type/employment-type.module.js';
import { PositionCategoryModule } from './academic/master-data/position-category/position-category.module.js';
import { ProfileModule } from './platform/profile/profile.module.js';
import { ReportCardModule } from './academic/report-card/report-card.module.js';
import { ScheduleModule as AcademicScheduleModule } from './academic/schedule/schedule.module.js';
import { ScholarshipModule } from './platform/profile/scholarship/scholarship.module.js';
import { SemesterModule } from './academic/semester/semester.module.js';
import { EnrollmentModule } from './academic/enrollment/enrollment.module.js';
import { GraduationModule } from './academic/graduation/graduation.module.js';
import { StudentModule } from './academic/student/student.module.js';
import { SubjectModule } from './academic/subject/subject.module.js';
import { TeachingAssignmentModule } from './academic/teaching-assignment/teaching-assignment.module.js';
import { UserModule } from './platform/user/user.module.js';
import { GradeModule } from './academic/grade/grade.module.js';
import { RoleModule } from './platform/access-control/role/role.module.js';
import { PermissionsModule } from './platform/access-control/permissions/permissions.module.js';
import { SessionModule } from './platform/session/session.module.js';
import { AuditLogModule } from './platform/audit-log/audit-log.module.js';
import { JwtAuthGuard } from './platform/auth/index.js';
import { PermissionsGuard } from './platform/access-control/permissions/guards/permissions.guard.js';
import { SettingsModule } from './platform/settings/settings.module.js';
import { NotificationModule } from './platform/notification/notification.module.js';
import { FileModule } from './platform/file/file.module.js';
import { ReligionModule } from './platform/master-data/religion/religion.module.js';
import { BloodTypeModule } from './platform/master-data/blood-type/blood-type.module.js';
import { AchievementTypeModule } from './platform/master-data/achievement-type/achievement-type.module.js';
import { AcademicCalendarTypeModule } from './academic/master-data/academic-calendar-type/academic-calendar-type.module.js';
import { SemesterTypeModule } from './academic/master-data/semester-type/semester-type.module.js';
import { InventoryModule } from './inventory/inventory.module.js';
import { AdmissionModule } from './admission/admission.module.js';

@Module({
  imports: [
    AppConfigModule,
    PrismaModule,
    StorageModule,
    LoggerModule.forRoot(pinoLoggerConfig),
    ScheduleModule.forRoot(),
    EventsModule,
    AppCacheModule,
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<
          'development' | 'production' | 'test'
        >('NODE_ENV', 'development');
        const isProduction = nodeEnv === 'production';

        return [
          {
            name: 'default',
            ttl: configService.get<number>('THROTTLE_TTL', 60000),
            limit: configService.get<number>(
              'THROTTLE_LIMIT',
              isProduction ? 100 : 500,
            ),
          },
          {
            name: 'auth',
            ttl: configService.get<number>('AUTH_THROTTLE_TTL', 60000),
            limit: configService.get<number>(
              'AUTH_THROTTLE_LIMIT',
              isProduction ? 5 : 20,
            ),
          },
        ];
      },
    }),
    HealthModule,
    DashboardModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionsModule,
    SessionModule,
    AuditLogModule,
    TeacherModule,
    SchoolUnitModule,
    OccupationModule,
    ParentModule,
    SocialMediaModule,
    PositionModule,
    EmploymentTypeModule,
    PositionCategoryModule,
    ProfileModule,
    StudentModule,
    ClassroomModule,
    GradeModule,
    SubjectModule,
    EducationModule,
    CurriculumModule,
    AssessmentModule,
    CalendarModule,
    AcademicYearModule,
    SemesterModule,
    EnrollmentModule,
    GraduationModule,
    TeachingAssignmentModule,
    AcademicScheduleModule,
    AttendanceModule,
    AnnouncementModule,
    AchievementModule,
    ScholarshipModule,
    EducationalHistoryModule,
    ReportCardModule,
    SettingsModule,
    NotificationModule,
    FileModule,
    ReligionModule,
    BloodTypeModule,
    AchievementTypeModule,
    AcademicCalendarTypeModule,
    SemesterTypeModule,
    InventoryModule,
    AdmissionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
