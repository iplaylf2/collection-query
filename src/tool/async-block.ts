import { Action } from "../type";

export class AsyncBlock<T = void> {
  constructor() {
    this._isBlock = false;
  }

  block() {
    if (this._isBlock) {
      throw "it was blocked";
    }

    this.blockPromise = new Promise((r) => (this.resolveBlock = r));
    this._isBlock = true;
  }

  unblock(x: T) {
    if (this._isBlock) {
      this._isBlock = false;
      this.resolveBlock(x);
    }
  }

  get isBlock() {
    return this._isBlock;
  }

  get wait() {
    return this.blockPromise;
  }

  private resolveBlock!: Action<T>;

  private _isBlock: boolean;
  private blockPromise!: Promise<T>;
}
