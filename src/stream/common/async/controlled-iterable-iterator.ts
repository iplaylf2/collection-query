import { Channel } from "../../../channel";

export enum IteratorStatus {
  Running,
  End,
  Crash,
}

export abstract class ControlledIterableIterator<T>
  implements AsyncIterableIterator<T> {
  constructor() {
    this.channel = new Channel();
    this._status = IteratorStatus.Running;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  async next(): Promise<IteratorResult<T, any>> {
    this.beforeNext();

    const [, x] = await this.channel.take();

    switch (this._status) {
      case IteratorStatus.Running:
        return { done: false, value: x! };
      case IteratorStatus.End:
        return { done: true, value: undefined };
      case IteratorStatus.Crash:
        this._status = IteratorStatus.End;
        throw this.error;
    }
  }

  async return(): Promise<IteratorResult<T, any>> {
    this.end();
    return { done: true, value: undefined };
  }

  end() {
    if (this._status === IteratorStatus.Running) {
      this.dispose();
      this._status = IteratorStatus.End;
    }
  }

  crash(error: any) {
    if (this._status === IteratorStatus.Running) {
      this.dispose();
      this.error = error;
      this._status = IteratorStatus.Crash;
    }
  }

  get status() {
    return this._status;
  }

  protected abstract beforeNext(): void;
  protected abstract onDispose(): void;

  protected readonly channel: Channel<T>;
  protected error: any;

  private dispose() {
    this.channel.close();
    this.onDispose();
  }

  private _status: IteratorStatus;
}
