export abstract class PartitionByCollectorBase<T> {
  constructor() {
    this.partition = [];
    this.start = false;
  }

  getRest(): [true, T[]] | [false] {
    return [(0 < this.partition.length) as true, this.partition];
  }

  protected dispatch(key: any, x: T): [true, T[]] | [false] {
    if (!this.start) {
      this.start = true;

      this.key = key;
    }

    if (key === this.key) {
      this.partition.push(x);
      return [false];
    } else {
      this.key = key;

      const result = this.partition;
      this.partition = [x];

      return [true, result];
    }
  }

  private partition: T[];
  private start: boolean;
  private key: any;
}
