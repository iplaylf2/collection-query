import { Action } from "./type";

export class AsyncBlock {
  constructor() {
    this.isBlock = false;
    this.resolveBlock = () => {};
  }

  block() {
    if (this.isBlock) {
      throw "it was blocked";
    }

    this.blockPromise = new Promise((r) => (this.resolveBlock = r));
    this.isBlock = true;
  }

  unblock() {
    this.isBlock = false;
    this.resolveBlock();
  }

  get wait() {
    return this.blockPromise;
  }

  private resolveBlock!: Action<void>;

  private isBlock: boolean;
  private blockPromise!: Promise<void>;
}
