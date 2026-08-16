import { Module } from '@nestjs/common';
import { TeachingAssignmentController } from './presentation/teaching-assignment.controller.js';
import { PrismaTeachingAssignmentRepository } from './infrastructure/persistence/prisma-teaching-assignment.repository.js';
import { CreateTeachingAssignmentUseCase } from './use-cases/create-teaching-assignment.use-case.js';
import { DeleteTeachingAssignmentUseCase } from './use-cases/delete-teaching-assignment.use-case.js';
import { GetTeachingAssignmentByIdUseCase } from './use-cases/get-teaching-assignment-by-id.use-case.js';
import { GetTeachingAssignmentsUseCase } from './use-cases/get-teaching-assignments.use-case.js';
import { GetMyTeachingAssignmentsUseCase } from './use-cases/get-my-teaching-assignments.use-case.js';
import { UpdateTeachingAssignmentUseCase } from './use-cases/update-teaching-assignment.use-case.js';
import { ITeachingAssignmentRepository } from './domain/interfaces/teaching-assignment-repository.interface.js';
import { TeacherModule } from '../teacher/teacher.module.js';

@Module({
  // For ITeacherIdentityReadPort — `GET /teaching-assignments/me` resolves the
  // caller from their teaching record rather than from what their role is
  // called. TeacherModule does not import this one, so no cycle and no
  // forwardRef.
  imports: [TeacherModule],
  controllers: [TeachingAssignmentController],
  providers: [
    {
      provide: ITeachingAssignmentRepository,
      useClass: PrismaTeachingAssignmentRepository,
    },
    GetTeachingAssignmentsUseCase,
    GetMyTeachingAssignmentsUseCase,
    GetTeachingAssignmentByIdUseCase,
    CreateTeachingAssignmentUseCase,
    UpdateTeachingAssignmentUseCase,
    DeleteTeachingAssignmentUseCase,
  ],
  exports: [ITeachingAssignmentRepository],
})
export class TeachingAssignmentModule {}
