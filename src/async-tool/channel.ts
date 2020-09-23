import { AsyncBlock } from "./async-block";
import { LinkedList } from "./linked-list";

export class Channel<T> {
  constructor(limit = Infinity) {
    this._limit = 0 < limit ? limit : 1;

    this.buffer = new LinkedList();
    this.putBlock = new AsyncBlock();
    this.takeBlock = new AsyncBlock();

    this.takeBlock.block();

    this._isClose = false;
  }

  async put(x: T): Promise<boolean> {
    begin: {
      await this.putBlock.wait;

      if (this._isClose) {
        return false;
      }

      if (this.buffer.length < this._limit) {
        this.buffer.put(x);

        if (this.buffer.length === this._limit) {
          this.putBlock.block();
        }
        if (1 === this.buffer.length) {
          this.takeBlock.unblock();
        }

        return true;
      } else {
        break begin;
      }
    }
    throw "never";
  }

  async take(): Promise<[true] | [false, T]> {
    begin: {
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
          if (this.buffer.length === this._limit - 1) {
            this.putBlock.unblock();
          }

          return [false, x];
        } else {
          break begin;
        }
      }
    }
    throw "never";
  }

  close() {
    if (!this.close) {
      this.putBlock.unblock();
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
  private readonly putBlock: AsyncBlock;
  private readonly takeBlock: AsyncBlock;
  private _isClose: boolean;
}
