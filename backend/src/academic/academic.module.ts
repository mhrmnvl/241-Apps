import { Module } from '@nestjs/common';
import { AcademicYearModule } from './academic-year/academic-year.module.js';
import { AssessmentModule } from './assessment/assessment.module.js';
import { AttendanceModule } from './attendance/attendance.module.js';
import { CalendarModule } from './calendar/calendar.module.js';
import { ClassroomModule } from './classroom/classroom.module.js';
import { CurriculumModule } from './curriculum/curriculum.module.js';
import { EnrollmentModule } from './enrollment/enrollment.module.js';
import { GradeModule } from './grade/grade.module.js';
import { GraduationModule } from './graduation/graduation.module.js';
import { AcademicCalendarTypeModule } from './master-data/academic-calendar-type/academic-calendar-type.module.js';
import { EmploymentTypeModule } from './master-data/employment-type/employment-type.module.js';
import { OccupationModule } from './master-data/occupation/occupation.module.js';
import { PositionCategoryModule } from './master-data/position-category/position-category.module.js';
import { PositionModule } from './master-data/position/position.module.js';
import { SemesterTypeModule } from './master-data/semester-type/semester-type.module.js';
import { ParentModule } from './parent/parent.module.js';
import { ReportCardModule } from './report-card/report-card.module.js';
import { ScheduleModule as AcademicScheduleModule } from './schedule/schedule.module.js';
import { AcademicSettingModule } from './academic-setting/academic-setting.module.js';
import { MyDashboardModule } from './my-dashboard/my-dashboard.module.js';
import { SemesterModule } from './semester/semester.module.js';
import { StudentModule } from './student/student.module.js';
import { SubjectModule } from './subject/subject.module.js';
import { TeacherModule } from './teacher/teacher.module.js';
import { TeachingAssignmentModule } from './teaching-assignment/teaching-assignment.module.js';

@Module({
  imports: [
    AcademicSettingModule,
    AcademicYearModule,
    AssessmentModule,
    AttendanceModule,
    CalendarModule,
    ClassroomModule,
    CurriculumModule,
    EnrollmentModule,
    GradeModule,
    GraduationModule,
    MyDashboardModule,
    AcademicCalendarTypeModule,
    EmploymentTypeModule,
    OccupationModule,
    PositionCategoryModule,
    PositionModule,
    SemesterTypeModule,
    ParentModule,
    ReportCardModule,
    AcademicScheduleModule,
    SemesterModule,
    StudentModule,
    SubjectModule,
    TeacherModule,
    TeachingAssignmentModule,
  ],
  exports: [
    AcademicSettingModule,
    AcademicYearModule,
    AssessmentModule,
    AttendanceModule,
    CalendarModule,
    ClassroomModule,
    CurriculumModule,
    EnrollmentModule,
    GradeModule,
    GraduationModule,
    AcademicCalendarTypeModule,
    EmploymentTypeModule,
    OccupationModule,
    PositionCategoryModule,
    PositionModule,
    SemesterTypeModule,
    ParentModule,
    ReportCardModule,
    AcademicScheduleModule,
    SemesterModule,
    StudentModule,
    SubjectModule,
    TeacherModule,
    TeachingAssignmentModule,
  ],
})
export class AcademicModule {}
