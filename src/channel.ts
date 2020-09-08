import { AsyncBlock } from "./async-block";

export class Channel<T> {
  constructor(limit = Infinity) {
    this._limit = limit > 0 ? limit : 1;
    this._isClose = false;
    this.buffer = new Buffer();

    this.putBlock = new AsyncBlock();
    this.takeBlock = new AsyncBlock();

    this.onFullBlock = new AsyncBlock();
    this.onLoadBlock = new AsyncBlock();
    this.onEmptyBlock = new AsyncBlock();
    this.onUnloadBlock = new AsyncBlock();
    this.onCloseBlock = new AsyncBlock();
  }

  async put(x: T) {
    begin: {
      await this.putBlock.wait;

      if (this._isClose) {
        return;
      }

      if (this.buffer.length < this._limit) {
        this.buffer.put(x);

        if (this.buffer.length === this._limit) {
          this.putBlock.block();
          this.onFullBlock.unblock();
        }
        if (1 === this.buffer.length) {
          this.takeBlock.unblock();
          this.onLoadBlock.unblock();
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
          this.onEmptyBlock.unblock();
        }
        if (this.buffer.length === this._limit - 1) {
          this.putBlock.unblock();
          this.onUnloadBlock.unblock();
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
      this.onCloseBlock.unblock();
    }
  }

  get isClose() {
    return this._isClose;
  }

  get limit() {
    return this._limit;
  }

  get length() {
    return this.buffer.length;
  }

  get onFull() {
    if (!this.onFullBlock.isBlock) {
      this.onFullBlock.block();
    }

    return this.onFullBlock.wait;
  }

  get onLoad() {
    if (!this.onLoadBlock.isBlock) {
      this.onLoadBlock.block();
    }

    return this.onLoadBlock.wait;
  }

  get onEmpty() {
    if (!this.onEmptyBlock.isBlock) {
      this.onEmptyBlock.block();
    }

    return this.onEmptyBlock.wait;
  }

  get onUnload() {
    if (!this.onUnloadBlock.isBlock) {
      this.onUnloadBlock.block();
    }

    return this.onUnloadBlock.wait;
  }

  get onClose() {
    if (!this.onCloseBlock.isBlock) {
      this.onCloseBlock.block();
    }

    return this.onCloseBlock.wait;
  }

  private _limit: number;
  private _isClose: boolean;
  private buffer: Buffer<T>;
  private putBlock: AsyncBlock;
  private takeBlock: AsyncBlock;
  private onFullBlock: AsyncBlock;
  private onLoadBlock: AsyncBlock;
  private onEmptyBlock: AsyncBlock;
  private onUnloadBlock: AsyncBlock;
  private onCloseBlock: AsyncBlock;
}

class Buffer<T> {
  constructor() {
    this._length = 0;
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
    this._length++;
  }

  take(): T {
    if (this.head === undefined) {
      throw "empty";
    } else {
      const result = this.head.x;
      this.head = this.head.next;
      this._length--;
      if (this._length === 0) {
        this.tail = undefined;
      }

      return result;
    }
  }

  clear() {
    this.head = undefined;
    this.tail = undefined;
  }

  get length() {
    return this._length;
  }

  private _length: number;
  private head?: LinkedList<T>;
  private tail?: LinkedList<T>;
}

interface LinkedList<T> {
  x: T;
  next?: LinkedList<T>;
}
