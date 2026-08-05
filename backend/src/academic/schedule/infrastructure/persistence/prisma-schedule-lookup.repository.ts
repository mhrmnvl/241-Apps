import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IScheduleLookupRepository } from '../../domain/interfaces/schedule-lookup-repository.interface.js';
import type { CreateTeachingAssignmentFromScheduleInput } from '../../domain/interfaces/schedule-repository.interface.js';
import {
  createTeachingAssignmentRow,
  findActiveSemesterId,
  findAnyTeacherIdBySubject,
  findTeachingAssignmentId,
  findTeachingAssignmentIdBySubject,
  findValidClassroomId,
} from './prisma-schedule.lookups.js';

/** Prisma adapter for the cross-aggregate reads the scheduling flow needs. */
@Injectable()
export class PrismaScheduleLookupRepository extends IScheduleLookupRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findTeachingAssignmentById(id: string) {
    return findTeachingAssignmentId(this.prisma, id);
  }

  async findValidClassroomById(id: string) {
    return findValidClassroomId(this.prisma, id);
  }

  async findActiveSemester() {
    return findActiveSemesterId(this.prisma);
  }

  async findTeachingAssignmentBySubjectAndSemester(
    classroomId: string,
    subjectId: string,
    semesterId: string,
  ) {
    return findTeachingAssignmentIdBySubject(
      this.prisma,
      classroomId,
      subjectId,
      semesterId,
    );
  }

  async findAnyTeacherIdForSubject(subjectId: string) {
    return findAnyTeacherIdBySubject(this.prisma, subjectId);
  }

  async createTeachingAssignment(
    input: CreateTeachingAssignmentFromScheduleInput,
  ) {
    return createTeachingAssignmentRow(this.prisma, input);
  }
}
