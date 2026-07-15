import type { Clock, IdGenerator } from '../ports';

export class FixedClock implements Clock {
  private readonly fixed: number;

  constructor(fixed: number) {
    this.fixed = fixed;
  }

  now(): number {
    return this.fixed;
  }
}

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;
  next(): string {
    this.counter += 1;
    return `id-${this.counter}`;
  }
}
