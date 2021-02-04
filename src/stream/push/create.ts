import { Action } from "../../type";
import {
  Cancel,
  EmitItem,
  Emitter,
  EmitType,
  Executor,
  ReceiveForm,
} from "./type";

export function create<T>(executor: Executor<T>): Emitter<T> {
  return (receiver, expose?) => {
    const handler = new EmitterHandler(executor, receiver, expose);

    return handler.cancel;
  };
}

class EmitterHandler<T> {
  constructor(
    executor: Executor<T>,
    receiver: ReceiveForm<T>,
    expose?: Action<Cancel>
  ) {
    this.receive = receiver;
    this.cancel = this._cancel.bind(this);
    if (expose) {
      expose(this.cancel);
    }

    this.open = true;

    try {
      this._dispose = executor(this.handle.bind(this)) as Cancel;
      if (!this.open) {
        this.dispose();
      }
    } catch (e) {
      if (this.open) {
        this.error(e);
      } else {
        throw e;
      }
    }
  }

  readonly cancel: Cancel;

  private handle(...[t, x]: EmitItem<T>) {
    if (this.open) {
      switch (t) {
        case EmitType.Next:
          this.next(x);
          break;
        case EmitType.Complete:
          this.complete();
          break;
        case EmitType.Error:
          this.error(x);
          break;
      }
    }
    return this.open;
  }

  private next(x: T) {
    try {
      this.receive(EmitType.Next, x);
    } catch (e) {
      this._cancel();
      throw e;
    }
  }

  private complete() {
    try {
      this.receive(EmitType.Complete);
    } finally {
      this._cancel();
    }
  }

  private error(x: any) {
    try {
      this.receive(EmitType.Error, x);
    } finally {
      this._cancel();
    }
  }

  private dispose() {
    if (this._dispose) {
      const dispose = this._dispose;
      this._dispose = null!;
      dispose();
    }
  }

  private _cancel() {
    this.receive = null!;
    this.open = false;
    this.dispose();
  }

  private receive: ReceiveForm<T>;
  private _dispose?: Cancel;
  private open: boolean;
}
