import { Action } from "../../../type";
import { IterateItem } from "../../pull/type";

export enum ZipCollectorStatus {
  Active,
  Pending,
  End,
  Crash,
}

export class ZipCollector<T> {
  constructor(total: number) {
    this.total = total;
    this.count = 0;
    this.content = new Array(total);

    this.status = ZipCollectorStatus.Pending;
    this.blockPromise = new Promise((resolve) => (this.unblock = resolve));
  }

  async zip(i: number, x: T) {
    begin: switch (this.status) {
      case ZipCollectorStatus.Active:
        this.count++;
        this.content[i] = x;

        if (this.count === this.total) {
          this.count = 0;

          this.status = ZipCollectorStatus.Pending;
          this.setNextResult([false, this.content]);
        }

        return this.blockPromise;
      case ZipCollectorStatus.Pending:
        await this.blockPromise;
        break begin;
      case ZipCollectorStatus.End:
        break;
      case ZipCollectorStatus.Crash:
        this.alreadyCrash();
    }
  }

  leave() {
    switch (this.status) {
      case ZipCollectorStatus.Active:
        this.status = ZipCollectorStatus.End;
        this.content = null!;
        this.setNextResult([true]);
        break;
      case ZipCollectorStatus.Pending:
        this.status = ZipCollectorStatus.End;
        this.content = null!;
        break;
      case ZipCollectorStatus.End:
        break;
      case ZipCollectorStatus.Crash:
        this.alreadyCrash();
    }
  }

  crash(e: any) {
    switch (this.status) {
      case ZipCollectorStatus.Active:
        this.status = ZipCollectorStatus.Crash;
        this.content = null!;
        this.setNextError(e);
        break;
      case ZipCollectorStatus.Pending:
        this.status = ZipCollectorStatus.Crash;
        this.content = null!;
        this.error = e;
        break;
      case ZipCollectorStatus.End:
        throw "never";
      case ZipCollectorStatus.Crash:
        this.alreadyCrash();
    }
  }

  async next(): Promise<IterateItem<T[]>> {
    switch (this.status) {
      case ZipCollectorStatus.Active:
        throw "never";
      case ZipCollectorStatus.Pending:
        this.status = ZipCollectorStatus.Active;

        this.unblock();
        this.blockPromise = new Promise((resolve) => (this.unblock = resolve));

        this.nextPromise = new Promise(
          (resolve, reject) => (
            (this.setNextResult = resolve), (this.setNextError = reject)
          )
        );

        return this.nextPromise;
      case ZipCollectorStatus.End:
        return [true];
      case ZipCollectorStatus.Crash:
        throw this.error;
    }
  }

  getStatus() {
    return this.status;
  }

  private alreadyCrash(): never {
    throw "zip collector crash";
  }

  private unblock!: Action<void>;
  private setNextResult!: Action<IterateItem<T[]>>;
  private setNextError!: Action<any>;

  private readonly total: number;
  private count: number;
  private content: T[];
  private error: any;
  private status!: ZipCollectorStatus;
  private blockPromise!: Promise<void>;
  private nextPromise!: Promise<IterateItem<T[]>>;
}
