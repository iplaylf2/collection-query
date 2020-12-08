import { AsyncBlock } from "./async-block";
import { LinkedList } from "./linked-list";

export class Channel<T> {
  constructor(limit = Infinity) {
    this._limit = 0 < limit ? limit : 1;

    this.buffer = new LinkedList();
    this.takeBlock = new AsyncBlock();

    this.takeBlock.block();

    this._isClose = false;
  }

  put(x: T): boolean {
    if (this.buffer.length < this._limit) {
      this.buffer.put(x);

      if (1 === this.buffer.length) {
        this.takeBlock.unblock();
      }

      return true;
    } else {
      return false;
    }
  }

  async take(): Promise<[true] | [false, T]> {
    while (true) {
      await this.takeBlock.wait;

      if (this._isClose) {
        if (0 < this.buffer.length) {
          return [false, this.buffer.take()];
        } else {
          return [true];
        }
      } else {
        if (0 < this.buffer.length) {
          const x = this.buffer.take();

          if (0 === this.buffer.length) {
            this.takeBlock.block();
          }

          return [false, x];
        } else {
          continue;
        }
      }
    }
  }

  async dump(): Promise<[true] | [false, T[]]> {
    while (true) {
      await this.takeBlock.wait;

      if (this._isClose) {
        if (0 < this.buffer.length) {
          const all = this.buffer.dump();
          return [false, all];
        } else {
          return [true];
        }
      } else {
        if (0 < this.buffer.length) {
          const all = this.buffer.dump();

          this.takeBlock.block();

          return [false, all];
        } else {
          continue;
        }
      }
    }
  }

  close() {
    if (!this.isClose) {
      this.takeBlock.unblock();
      this._isClose = true;
    }
  }

  get limit() {
    return this._limit;
  }

  get length() {
    return this.buffer.length;
  }

  get isClose() {
    return this._isClose;
  }

  private _limit: number;
  private readonly buffer: LinkedList<T>;
  private readonly takeBlock: AsyncBlock;
  private _isClose: boolean;
}
