export class StudentCreatedEvent {
  constructor(
    public readonly studentId: string,
    public readonly classroomId?: string,
  ) {}
}

export class StudentStatusChangedEvent {
  constructor(
    public readonly studentId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
  ) {}
}
