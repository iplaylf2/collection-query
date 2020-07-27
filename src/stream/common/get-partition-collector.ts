export abstract class PartitionCollector<T> {
  constructor(n: number, step: number) {
    this.n = n;
    this.step = step;
  }

  abstract collect(x: T): [true, T[]] | [false];

  getRest() {
    return this.cache;
  }

  protected n: number;
  protected step: number;
  protected cache!: T[];
}

export function getPartitionCollector<T>(
  n: number,
  step: number
): PartitionCollector<T> {
  if (n < step) {
    return new PartitionCollectorA<T>(n, step);
  } else {
    return new PartitionCollectorB<T>(n, step);
  }
}

class PartitionCollectorA<T> extends PartitionCollector<T> {
  constructor(n: number, step: number) {
    super(n, step);
    this.cache = new Array(n);

    this.active = true;
    this.count = 0;
  }

  collect(x: T): [true, T[]] | [false] {
    if (this.active) {
      this.cache[this.count] = x;
      this.count++;

      if (this.count === this.n) {
        this.active = false;

        const result = this.cache.slice();
        this.cache = new Array(this.n);

        return [true, result];
      }
    } else {
      this.count++;

      if (this.count === this.step) {
        this.active = true;
        this.count = 0;
      }
    }

    return [false];
  }

  private active: boolean;
  private count: number;
}

class PartitionCollectorB<T> extends PartitionCollector<T> {
  constructor(n: number, step: number) {
    super(n, step);
    this.cache = [];
  }

  collect(x: T): [true, T[]] | [false] {
    this.cache.push(x);
    if (this.cache.length === this.n) {
      const result = this.cache.slice();
      this.cache.splice(0, this.step);

      return [true, result];
    }

    return [false];
  }
}
