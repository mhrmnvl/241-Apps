export class StudentStatusChangedEvent {
  constructor(
    public readonly studentId: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
  ) {}
}
