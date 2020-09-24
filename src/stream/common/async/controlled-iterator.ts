export enum IteratorStatus {
  Running,
  End,
  Crash,
}

export abstract class ControlledIterator<T>
  implements AsyncIterableIterator<T> {
  constructor() {
    this._status = IteratorStatus.Running;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  async next(): Promise<IteratorResult<T, any>> {
    const x = await this.getNext();

    switch (this._status) {
      case IteratorStatus.Running:
        return { done: false, value: x };
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
      this.onDispose();
      this._status = IteratorStatus.End;
    }
  }

  crash(error: any) {
    if (this._status === IteratorStatus.Running) {
      this.onDispose();
      this.error = error;
      this._status = IteratorStatus.Crash;
    }
  }

  get status() {
    return this._status;
  }

  protected abstract getNext(): Promise<T>;
  protected abstract onDispose(): void;

  protected error: any;

  private _status: IteratorStatus;
}
