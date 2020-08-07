import { Action } from "../../../type";
import { IterateItem } from "../../pull/type";

export class ZipCollector<T> {
  constructor(total: number) {
    this.total = total;
    this.count = 0;
    this.content = new Array(total);
    this.isCrash = false;

    this.blockPromise = new Promise((resolve) => (this.unblock = resolve));
  }

  async prepare() {
    return this.blockPromise;
  }

  async zip(i: number, x: T) {
    this.checkCrash();

    this.count++;
    this.content[i] = x;

    if (this.count === this.total) {
      this.count = 0;
      this.setNextResult([false, this.content]);
    }

    return this.blockPromise;
  }

  leave() {
    this.checkCrash();

    this.setNextResult([true]);
  }

  crash(e: any) {
    this.checkCrash();

    this.isCrash = true;
    this.content = null!;
    this.setNextError(e);
  }

  async next() {
    this.unblock();
    this.blockPromise = new Promise((resolve) => (this.unblock = resolve));

    this.nextPromise = new Promise(
      (resolve, reject) => (
        (this.setNextResult = resolve), (this.setNextError = reject)
      )
    );

    return this.nextPromise;
  }

  private checkCrash() {
    if (this.isCrash) {
      throw "zip collector crash";
    }
  }

  private unblock!: Action<void>;
  private setNextResult!: Action<IterateItem<T[]>>;
  private setNextError!: Action<any>;

  private readonly total: number;
  private count: number;
  private content: T[];
  private isCrash: boolean;
  private blockPromise!: Promise<void>;
  private nextPromise!: Promise<IterateItem<T[]>>;
}
