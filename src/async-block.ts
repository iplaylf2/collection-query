import { Action } from "./type";

export class AsyncBlock {
  constructor() {
    this._isBlock = false;
    this.resolveBlock = () => {};
  }

  block() {
    if (this._isBlock) {
      throw "it was blocked";
    }

    this.blockPromise = new Promise((r) => (this.resolveBlock = r));
    this._isBlock = true;
  }

  unblock() {
    this._isBlock = false;
    this.resolveBlock();
  }

  get isBlock() {
    return this._isBlock;
  }

  get wait() {
    return this.blockPromise;
  }

  private resolveBlock!: Action<void>;

  private _isBlock: boolean;
  private blockPromise!: Promise<void>;
}
