import { Module } from '@nestjs/common';
import { UserModule } from '../../platform/user/user.module.js';
import { TeacherController } from './presentation/teacher.controller.js';
import { TeacherAddressController } from './presentation/teacher-address.controller.js';
import { TeacherPositionsController } from './presentation/teacher-position.controller.js';
import { TeacherRepository } from './repositories/teacher.repository.js';
import { TeacherAddressRepository } from './repositories/teacher-address.repository.js';
import { TeacherPositionsRepository } from './repositories/teacher-position.repository.js';
import { PrismaTeacherRepository } from './infrastructure/persistence/prisma-teacher.repository.js';
import { PrismaTeacherAddressRepository } from './infrastructure/persistence/prisma-teacher-address.repository.js';
import { PrismaTeacherPositionsRepository } from './infrastructure/persistence/prisma-teacher-position.repository.js';
import { CreateTeacherUseCase } from './use-cases/create-teacher.use-case.js';
import { DeleteTeacherUseCase } from './use-cases/delete-teacher.use-case.js';
import { GetTeacherByIdUseCase } from './use-cases/get-teacher-by-id.use-case.js';
import { GetTeachersUseCase } from './use-cases/get-teachers.use-case.js';
import { UpdateTeacherUseCase } from './use-cases/update-teacher.use-case.js';
import { UpdateTeacherProfileUseCase } from './use-cases/update-teacher-profile.use-case.js';
import { ToggleTeacherActiveUseCase } from './use-cases/toggle-teacher-active.use-case.js';
import { BulkImportTeachersUseCase } from './use-cases/bulk-import-teacher.use-case.js';
import { ResolveBulkImportConflictsUseCase } from './use-cases/resolve-bulk-import-conflicts.use-case.js';
import { ExportTeachersUseCase } from './use-cases/export-teacher.use-case.js';
import { TeacherAddressUseCase } from './use-cases/teacher-address.use-case.js';
import { TeacherPositionUseCase } from './use-cases/teacher-position.use-case.js';

@Module({
  imports: [UserModule],
  controllers: [
    TeacherController,
    TeacherAddressController,
    TeacherPositionsController,
  ],
  providers: [
    { provide: TeacherRepository, useClass: PrismaTeacherRepository },
    {
      provide: TeacherAddressRepository,
      useClass: PrismaTeacherAddressRepository,
    },
    {
      provide: TeacherPositionsRepository,
      useClass: PrismaTeacherPositionsRepository,
    },
    CreateTeacherUseCase,
    DeleteTeacherUseCase,
    GetTeacherByIdUseCase,
    GetTeachersUseCase,
    UpdateTeacherUseCase,
    UpdateTeacherProfileUseCase,
    ToggleTeacherActiveUseCase,
    BulkImportTeachersUseCase,
    ResolveBulkImportConflictsUseCase,
    ExportTeachersUseCase,
    TeacherAddressUseCase,
    TeacherPositionUseCase,
  ],
  exports: [
    TeacherRepository,
    TeacherAddressRepository,
    TeacherPositionsRepository,
  ],
})
export class TeacherModule {}
