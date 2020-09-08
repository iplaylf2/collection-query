import { AsyncBlock } from "./async-block";

export class Channel<T> {
  constructor(limit = Infinity) {
    this.limit = limit > 0 ? limit : 1;
    this._isClose = false;
    this.buffer = new Buffer();

    this.putBlock = new AsyncBlock();
    this.takeBlock = new AsyncBlock();
  }

  async put(x: T) {
    begin: {
      await this.putBlock.wait;

      if (this._isClose) {
        return;
      }

      if (this.buffer.length < this.limit) {
        this.buffer.put(x);

        if (this.buffer.length === this.limit) {
          this.putBlock.block();
        }
        if (1 === this.buffer.length) {
          this.takeBlock.unblock();
        }

        return;
      } else {
        break begin;
      }
    }
  }

  async take(): Promise<[true] | [false, T]> {
    begin: {
      await this.takeBlock.wait;

      if (this._isClose) {
        return [true];
      }

      if (0 < this.buffer.length) {
        const x = this.buffer.take();

        if (this.buffer.length === 0) {
          this.takeBlock.block();
        }
        if (this.buffer.length === this.limit - 1) {
          this.putBlock.unblock();
        }

        return [false, x];
      } else {
        break begin;
      }
    }
    throw "never";
  }

  close() {
    if (!this.close) {
      this._isClose = true;
      this.buffer.clear();
      this.putBlock.unblock();
      this.takeBlock.unblock();
    }
  }

  isClose() {
    return this._isClose;
  }

  getLimit() {
    return this.limit;
  }

  getLength() {
    return this.buffer.length;
  }

  private limit: number;
  private _isClose: boolean;
  private buffer: Buffer<T>;
  private putBlock: AsyncBlock;
  private takeBlock: AsyncBlock;
}

class Buffer<T> {
  constructor() {
    this.length = 0;
  }

  put(x: T) {
    const node = { x };
    if (this.tail === undefined) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }
    this.length++;
  }

  take(): T {
    if (this.head === undefined) {
      throw "empty";
    } else {
      const result = this.head.x;
      this.head = this.head.next;
      this.length--;
      if (this.length === 0) {
        this.tail = undefined;
      }

      return result;
    }
  }

  clear() {
    this.head = undefined;
    this.tail = undefined;
  }

  length: number;
  private head?: LinkedList<T>;
  private tail?: LinkedList<T>;
}

interface LinkedList<T> {
  x: T;
  next?: LinkedList<T>;
}
