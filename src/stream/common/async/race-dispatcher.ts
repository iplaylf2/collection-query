import { IterateItem } from "../../pull/type";
import { Action } from "../../../type";

export class RaceDispatcher<T> {
  constructor(total: number) {
    this.count = total;
    this.pending();
  }

  async race(x: T) {
    begin: switch (this.status) {
      case RaceDispatcherStatus.Active:
        this.pending();
        this.setNextResult([false, x]);

        return this.blockPromise;
      case RaceDispatcherStatus.Pending:
        await this.blockPromise;
        break begin;
      case RaceDispatcherStatus.Crash:
        throw "race dispatcher crash";
    }
  }

  leave() {
    this.count--;
    if (!(this.count > 0)) {
      this.setNextResult([true]);
    }
  }

  crash(e: any) {
    switch (this.status) {
      case RaceDispatcherStatus.Active:
        this.setNextError(e);
        break;
      case RaceDispatcherStatus.Pending:
        this.status = RaceDispatcherStatus.Crash;
        this.error = e;
        break;
      case RaceDispatcherStatus.Crash:
        throw e;
    }
  }

  async next() {
    switch (this.status) {
      case RaceDispatcherStatus.Active:
        throw "never";
      case RaceDispatcherStatus.Pending:
        this.status = RaceDispatcherStatus.Active;

        this.nextPromise = new Promise(
          (resolve, reject) => (
            (this.setNextResult = resolve), (this.setNextError = reject)
          )
        );
        this.unblock();

        return this.nextPromise;
      case RaceDispatcherStatus.Crash:
        throw this.error;
    }
  }

  private pending() {
    this.status = RaceDispatcherStatus.Pending;
    this.blockPromise = new Promise((resolve) => (this.unblock = resolve));
  }

  private unblock!: Action<void>;
  private setNextResult!: Action<IterateItem<T>>;
  private setNextError!: Action<any>;

  private count: number;
  private status!: RaceDispatcherStatus;
  private error: any;
  private blockPromise!: Promise<void>;
  private nextPromise!: Promise<IterateItem<T>>;
}

enum RaceDispatcherStatus {
  Active,
  Pending,
  Crash,
}
