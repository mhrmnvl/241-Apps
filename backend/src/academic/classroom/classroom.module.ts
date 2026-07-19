import { Module } from '@nestjs/common';
import { ClassroomController } from './presentation/classroom.controller.js';
import { ClassroomStructuresController } from './presentation/classroom-structures.controller.js';
import { ClassroomSupervisorsController } from './presentation/classroom-supervisors.controller.js';
import { ClassroomRepository } from './repositories/classroom.repository.js';
import { ClassroomStructuresRepository } from './repositories/classroom-structures.repository.js';
import { ClassroomSupervisorsRepository } from './repositories/classroom-supervisors.repository.js';
import { PrismaClassroomRepository } from './infrastructure/persistence/prisma-classroom.repository.js';
import { PrismaClassroomStructuresRepository } from './infrastructure/persistence/prisma-classroom-structures.repository.js';
import { PrismaClassroomSupervisorsRepository } from './infrastructure/persistence/prisma-classroom-supervisors.repository.js';
import { CreateClassroomUseCase } from './use-cases/create-classroom.use-case.js';
import { DeleteClassroomUseCase } from './use-cases/delete-classroom.use-case.js';
import { GetClassroomByIdUseCase } from './use-cases/get-classroom-by-id.use-case.js';
import { GetClassroomsUseCase } from './use-cases/get-classrooms.use-case.js';
import { UpdateClassroomUseCase } from './use-cases/update-classroom.use-case.js';
import { CreateClassroomStructureUseCase } from './use-cases/create-classroom-structure.use-case.js';
import { DeleteClassroomStructureUseCase } from './use-cases/delete-classroom-structure.use-case.js';
import { GetClassroomStructuresUseCase } from './use-cases/get-classroom-structures.use-case.js';
import { UpdateClassroomStructureUseCase } from './use-cases/update-classroom-structure.use-case.js';
import { CreateClassroomSupervisorUseCase } from './use-cases/create-classroom-supervisor.use-case.js';
import { DeleteClassroomSupervisorUseCase } from './use-cases/delete-classroom-supervisor.use-case.js';
import { GetClassroomSupervisorByIdUseCase } from './use-cases/get-classroom-supervisor-by-id.use-case.js';
import { GetClassroomSupervisorsUseCase } from './use-cases/get-classroom-supervisors.use-case.js';
import { UpdateClassroomSupervisorUseCase } from './use-cases/update-classroom-supervisor.use-case.js';

@Module({
  controllers: [
    ClassroomController,
    ClassroomStructuresController,
    ClassroomSupervisorsController,
  ],
  providers: [
    { provide: ClassroomRepository, useClass: PrismaClassroomRepository },
    {
      provide: ClassroomStructuresRepository,
      useClass: PrismaClassroomStructuresRepository,
    },
    {
      provide: ClassroomSupervisorsRepository,
      useClass: PrismaClassroomSupervisorsRepository,
    },
    CreateClassroomUseCase,
    DeleteClassroomUseCase,
    GetClassroomByIdUseCase,
    GetClassroomsUseCase,
    UpdateClassroomUseCase,
    CreateClassroomStructureUseCase,
    DeleteClassroomStructureUseCase,
    GetClassroomStructuresUseCase,
    UpdateClassroomStructureUseCase,
    CreateClassroomSupervisorUseCase,
    DeleteClassroomSupervisorUseCase,
    GetClassroomSupervisorByIdUseCase,
    GetClassroomSupervisorsUseCase,
    UpdateClassroomSupervisorUseCase,
  ],
  exports: [
    ClassroomRepository,
    ClassroomStructuresRepository,
    ClassroomSupervisorsRepository,
  ],
})
export class ClassroomModule {}
