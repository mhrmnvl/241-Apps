import { Injectable } from '@nestjs/common';
import { IScheduleRepository } from '../domain/interfaces/schedule-repository.interface.js';

@Injectable()
export class GetSchedulesByClassroomUseCase {
  constructor(private readonly repo: IScheduleRepository) {}
  async execute(classroomId: string) {
    return this.repo.findByClassroom(classroomId);
  }
}
