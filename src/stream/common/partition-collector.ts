export class PartitionCollector<T> {
  constructor(n: number) {
    this.n = n;
    this.partition = [];
  }

  collect(x: T): [true, T[]] | [false] {
    this.partition.push(x);

    if (this.partition.length === this.n) {
      const result = this.partition;
      this.partition = [];

      return [true, result];
    } else {
      return [false];
    }
  }

  getRest(): [true, T[]] | [false] {
    return [(0 < this.partition.length) as true, this.partition];
  }

  private readonly n: number;
  private partition: T[];
}
