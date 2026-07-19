export abstract class BaseEntity<T = string> {
  constructor(public readonly id: T) {}
}
