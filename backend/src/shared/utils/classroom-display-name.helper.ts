interface ClassroomWithLevel {
  name: string | null;
  grade?: { name: string } | null;
}

export function withDisplayName<T extends ClassroomWithLevel>(
  classroom: T,
): T & { displayName: string } {
  return {
    ...classroom,
    displayName: classroom.grade
      ? classroom.name
        ? `${classroom.grade.name} ${classroom.name}`
        : classroom.grade.name
      : (classroom.name ?? ''),
  };
}
