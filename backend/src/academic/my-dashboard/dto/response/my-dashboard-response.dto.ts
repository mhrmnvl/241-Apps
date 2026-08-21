import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardSemesterResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'Ganjil' })
  name!: string;
}

export class DashboardTodayResponseDto {
  @ApiProperty({ example: '2026-08-21' })
  date!: string;

  @ApiProperty({
    example: false,
    description:
      "Whether today is one of the school's weekly holidays, so an empty " +
      'timetable can say why it is empty.',
  })
  isWeeklyHoliday!: boolean;
}

export class DashboardClassroomResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  id!: string;

  @ApiProperty({ example: 'VIII-A' })
  code!: string;

  @ApiProperty({ example: 'Kelas VIII A', nullable: true })
  name!: string | null;
}

export class DashboardLessonResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440002' })
  id!: string;

  @ApiProperty({ example: '07:00', description: 'Wall clock, HH:mm' })
  startTime!: string;

  @ApiProperty({ example: '08:20', description: 'Wall clock, HH:mm' })
  endTime!: string;

  @ApiProperty({ example: 'Matematika' })
  subjectName!: string;

  @ApiProperty({
    example: 'VIII-A',
    nullable: true,
    description: 'The class being taught. Present on a teacher\u2019s row.',
  })
  classroomCode!: string | null;

  @ApiProperty({
    example: 'Siti Aminah',
    nullable: true,
    description: 'Who takes the lesson. Present on a student\u2019s row.',
  })
  teacherName!: string | null;

  @ApiProperty({ example: 'R-08', nullable: true })
  room!: string | null;
}

export class DashboardAttendanceRecapResponseDto {
  @ApiProperty({ example: 120 })
  present!: number;

  @ApiProperty({ example: 2 })
  absent!: number;

  @ApiProperty({ example: 3 })
  late!: number;

  @ApiProperty({ example: 1 })
  excused!: number;

  @ApiProperty({ example: 4 })
  sick!: number;
}

export class DashboardScoreResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440003' })
  id!: string;

  @ApiProperty({ example: 'Matematika' })
  subjectName!: string;

  @ApiProperty({ example: 'Ulangan Harian 2' })
  assessmentName!: string;

  @ApiProperty({ example: 85, nullable: true })
  score!: number | null;

  @ApiProperty({
    example: 100,
    description:
      'The maximum this assessment is marked out of. Sent because a score is ' +
      'meaningless without it: 40 out of 50 is not a failing 40.',
  })
  maxScore!: number;
}

export class DashboardReportCardResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440004' })
  id!: string;

  @ApiProperty({ example: 'Ganjil' })
  semesterName!: string;
}

export class DashboardTeachingLoadResponseDto {
  @ApiProperty({ example: 4, description: 'Distinct classes taught' })
  classroomCount!: number;

  @ApiProperty({ example: 2, description: 'Distinct subjects taught' })
  subjectCount!: number;
}

export class DashboardSupervisedClassroomResponseDto extends DashboardClassroomResponseDto {
  @ApiProperty({ example: 32, description: 'Students enrolled this semester' })
  studentCount!: number;
}

export class DashboardUngradedAssessmentResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440005' })
  id!: string;

  @ApiProperty({ example: 'Ulangan Harian 2' })
  name!: string;

  @ApiProperty({ example: 'Matematika' })
  subjectName!: string;

  @ApiProperty({ example: 'VIII-A' })
  classroomCode!: string;

  @ApiProperty({ example: 12, description: 'Students marked so far' })
  gradedCount!: number;

  @ApiProperty({ example: 32, description: 'Students enrolled in the class' })
  studentCount!: number;
}

export class MyStudentDashboardResponseDto {
  @ApiProperty({
    type: () => DashboardClassroomResponseDto,
    nullable: true,
    description:
      'Null between years, when no enrolment exists for the active semester.',
  })
  classroom!: DashboardClassroomResponseDto | null;

  @ApiProperty({ type: () => [DashboardLessonResponseDto] })
  todayLessons!: DashboardLessonResponseDto[];

  @ApiProperty({ type: () => DashboardAttendanceRecapResponseDto })
  attendance!: DashboardAttendanceRecapResponseDto;

  @ApiProperty({ type: () => [DashboardScoreResponseDto] })
  latestScores!: DashboardScoreResponseDto[];

  @ApiProperty({
    type: () => DashboardReportCardResponseDto,
    nullable: true,
    description:
      'The most recent published report card. An unpublished one is a draft ' +
      'the school has not handed over, and is never returned here.',
  })
  latestReportCard!: DashboardReportCardResponseDto | null;
}

export class MyTeacherDashboardResponseDto {
  @ApiProperty({ type: () => [DashboardLessonResponseDto] })
  todayLessons!: DashboardLessonResponseDto[];

  @ApiProperty({ type: () => DashboardTeachingLoadResponseDto })
  load!: DashboardTeachingLoadResponseDto;

  @ApiProperty({
    type: () => [DashboardSupervisedClassroomResponseDto],
    description: 'Classes this teacher is wali kelas for. Usually empty.',
  })
  supervisedClassrooms!: DashboardSupervisedClassroomResponseDto[];

  @ApiProperty({
    type: () => [DashboardUngradedAssessmentResponseDto],
    description: 'The first few outstanding assessments, for the panel.',
  })
  ungradedAssessments!: DashboardUngradedAssessmentResponseDto[];

  @ApiProperty({
    example: 7,
    description:
      'How many assessments are outstanding in total, so a panel showing ' +
      'five is never read as five remaining.',
  })
  ungradedTotal!: number;
}

/**
 * Both halves, either of which may be null.
 *
 * Null means the caller has no such record — not that it is empty. A teacher
 * with nothing to teach today still has a teacher half, with no lessons in it,
 * and that is what lets one endpoint answer for a student, a teacher, and the
 * person who is both without anyone asking what their role is called.
 */
export class MyDashboardResponseDto {
  @ApiProperty({
    type: () => DashboardSemesterResponseDto,
    nullable: true,
    description: 'The active semester, or null between years.',
  })
  semester!: DashboardSemesterResponseDto | null;

  @ApiProperty({ type: () => DashboardTodayResponseDto })
  today!: DashboardTodayResponseDto;

  @ApiPropertyOptional({
    type: () => MyStudentDashboardResponseDto,
    nullable: true,
    description: 'Null when the caller has no student record.',
  })
  student!: MyStudentDashboardResponseDto | null;

  @ApiPropertyOptional({
    type: () => MyTeacherDashboardResponseDto,
    nullable: true,
    description: 'Null when the caller has no teacher record.',
  })
  teacher!: MyTeacherDashboardResponseDto | null;
}
