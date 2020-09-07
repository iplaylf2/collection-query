import { Action } from "./type";

export class Channel<T> {
  constructor(limit = Infinity) {
    this.limit = limit > 0 ? limit : 1;
    this._isClose = false;
    this.buffer = new Buffer();

    this.blockTake();
  }

  async put(x: T) {
    begin: {
      await this.putBlock;

      if (this._isClose) {
        return;
      }

      if (this.buffer.length < this.limit) {
        this.buffer.put(x);

        if (this.buffer.length === this.limit) {
          this.blockPut();
        }
        if (1 === this.buffer.length) {
          this.unblockTake();
        }

        return;
      } else {
        break begin;
      }
    }
  }

  async take(): Promise<[true] | [false, T]> {
    begin: {
      await this.takeBlock;

      if (this._isClose) {
        return [true];
      }

      if (0 < this.buffer.length) {
        const x = this.buffer.take();

        if (this.buffer.length === 0) {
          this.blockTake();
        }
        if (this.buffer.length === this.limit - 1) {
          this.unblockPut();
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
      this.unblockPut();
      this.unblockTake();
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

  private blockPut() {
    this.putBlock = new Promise((r) => (this.unblockPut = r));
  }

  private blockTake() {
    this.takeBlock = new Promise((r) => (this.unblockTake = r));
  }

  private unblockPut!: Action<void>;
  private unblockTake!: Action<void>;

  private limit: number;
  private _isClose: boolean;
  private buffer: Buffer<T>;
  private putBlock!: Promise<void>;
  private takeBlock!: Promise<void>;
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
