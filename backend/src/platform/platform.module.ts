import { Module } from '@nestjs/common';
import { PermissionModule } from './access-control/permission/permission.module.js';
import { RoleModule } from './access-control/role/role.module.js';
import { AnnouncementModule } from './announcement/announcement.module.js';
import { AuditLogModule } from './audit-log/audit-log.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { FileModule } from './file/file.module.js';
import { AchievementTypeModule } from './master-data/achievement-type/achievement-type.module.js';
import { BloodTypeModule } from './master-data/blood-type/blood-type.module.js';
import { EducationModule } from './master-data/education/education.module.js';
import { ReligionModule } from './master-data/religion/religion.module.js';
import { SocialMediaModule } from './master-data/social-media/social-media.module.js';
import { NotificationModule } from './notification/notification.module.js';
import { AchievementModule } from './profile/achievement/achievement.module.js';
import { EducationalHistoryModule } from './profile/educational-history/educational-history.module.js';
import { ProfileModule } from './profile/profile.module.js';
import { ScholarshipModule } from './profile/scholarship/scholarship.module.js';
import { SchoolUnitModule } from './school-unit/school-unit.module.js';
import { SessionModule } from './session/session.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { UserModule } from './user/user.module.js';

@Module({
  imports: [
    PermissionModule,
    RoleModule,
    AnnouncementModule,
    AuditLogModule,
    AuthModule,
    DashboardModule,
    FileModule,
    AchievementTypeModule,
    BloodTypeModule,
    EducationModule,
    ReligionModule,
    SocialMediaModule,
    NotificationModule,
    AchievementModule,
    EducationalHistoryModule,
    ProfileModule,
    ScholarshipModule,
    SchoolUnitModule,
    SessionModule,
    SettingsModule,
    UserModule,
  ],
  exports: [
    PermissionModule,
    RoleModule,
    AnnouncementModule,
    AuditLogModule,
    AuthModule,
    DashboardModule,
    FileModule,
    AchievementTypeModule,
    BloodTypeModule,
    EducationModule,
    ReligionModule,
    SocialMediaModule,
    NotificationModule,
    AchievementModule,
    EducationalHistoryModule,
    ProfileModule,
    ScholarshipModule,
    SchoolUnitModule,
    SessionModule,
    SettingsModule,
    UserModule,
  ],
})
export class PlatformModule {}
