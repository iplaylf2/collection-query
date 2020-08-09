import { PartitionByCollectorBase } from "./partition-by-collector-base";
import { Selector, AsyncSelector } from "../../../type";

export class AsyncPartitionByCollector<T> extends PartitionByCollectorBase<T> {
  constructor(f: Selector<T, any> | AsyncSelector<T, any>) {
    super();
    this.f = f;
  }

  async collect(x: T): Promise<[true, T[]] | [false]> {
    const key = await this.f(x);

    return this.dispatch(key, x);
  }

  private readonly f: Selector<T, any> | AsyncSelector<T, any>;
}
