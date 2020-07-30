import { Selector } from "../../type";

export class PartitionByCollector<T> {
  constructor(f: Selector<T, any>) {
    this.f = f;
    this.partition = [];
    this.start = false;
  }

  collect(x: T): [true, T[]] | [false] {
    const key = this.f(x);

    if (!this.start) {
      this.start = true;

      this.key = key;
    }

    if (key === this.key) {
      this.partition.push(x);
      return [false];
    } else {
      this.key = key;

      const result = this.partition.slice();
      this.partition = [x];

      return [true, result];
    }
  }

  getRest(): [true, T[]] | [false] {
    return [(this.partition.length > 0) as true, this.partition];
  }

  private readonly f: Selector<T, any>;
  private partition: T[];
  private start: boolean;
  private key: any;
}
