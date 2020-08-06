import { IterateItem } from "../../pull/type";
import { Action } from "../../../type";

export class RaceDispatcher<T> {
  constructor(total: number) {
    this.count = total;
    this.pending();
  }

  async race(x: T) {
    while (true) {
      await this.blockPromise;
      
      switch (this.status) {
        case RaceDispatcherStatus.Active:
          this.pending();
          this.setNextResult([false, x]);

          return this.blockPromise;
        case RaceDispatcherStatus.Pending:
          break;
        case RaceDispatcherStatus.Crash:
          throw "race dispatcher crash";
      }
    }
  }

  leave() {
    this.count--;
    if (!(this.count > 0)) {
      this.setNextResult([true]);
    }
  }

  crash(e: any) {
    this.status = RaceDispatcherStatus.Crash;
    this.error = e;
  }

  async next() {
    switch (this.status) {
      case RaceDispatcherStatus.Active:
        throw "never";
      case RaceDispatcherStatus.Pending:
        this.status = RaceDispatcherStatus.Active;

        this.nextPromise = new Promise(
          (resolve) => (this.setNextResult = resolve)
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
