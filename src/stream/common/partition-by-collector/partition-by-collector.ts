import { Selector } from "../../../type";
import { PartitionByCollectorBase } from "./partition-by-collector-base";

export class PartitionByCollector<T> extends PartitionByCollectorBase<T> {
  constructor(f: Selector<T, any>) {
    super();
    this.f = f;
  }

  collect(x: T): [true, T[]] | [false] {
    const key = this.f(x);

    return this.dispatch(key, x);
  }

  private readonly f: Selector<T, any>;
}
