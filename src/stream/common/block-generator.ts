import { Action } from "../../type";
import { IterateItem } from "../pull/type";

export enum BlockGeneratorStatus {
  Active,
  Pending,
  End,
  Crash,
}

export abstract class BlockGenerator<T> {
  abstract async next(): Promise<IterateItem<T>>;

  return() {
    switch (this.status) {
      case BlockGeneratorStatus.Active:
        this.status = BlockGeneratorStatus.End;
        this.setNextResult([true]);
        break;
      case BlockGeneratorStatus.Pending:
        this.status = BlockGeneratorStatus.End;
        break;
      case BlockGeneratorStatus.End:
      case BlockGeneratorStatus.Crash:
        break;
    }
  }

  throw(e: any) {
    switch (this.status) {
      case BlockGeneratorStatus.Active:
        this.status = BlockGeneratorStatus.Crash;
        this.setNextError(e);
        break;
      case BlockGeneratorStatus.Pending:
        this.status = BlockGeneratorStatus.Crash;
        this.error = e;
        break;
      case BlockGeneratorStatus.End:
      case BlockGeneratorStatus.Crash:
        break;
    }
  }

  private unblock!: Action<void>;
  private setNextResult!: Action<IterateItem<T>>;
  private setNextError!: Action<any>;

  protected status!: BlockGeneratorStatus;
  private error: any;
  private blockPromise!: Promise<void>;
  private nextPromise!: Promise<IterateItem<T>>;
}
