import { Selector } from "../../type";
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

    return handler.cancel.bind(handler);
  };
}

class EmitterHandler<T> {
  constructor(
    executor: Executor<T>,
    receiver: ReceiveForm<T>,
    expose?: Selector<Cancel, void | Cancel>
  ) {
    this.receive = receiver;
    if (expose) {
      this._dispose = expose(this.cancel.bind(this)) as Cancel;
    }

    this.open = true;

    try {
      executor(this.handle.bind(this));
    } catch (e) {
      if (this.open) {
        this.error(e);
      } else {
        throw e;
      }
    }
  }

  cancel() {
    this.receive = null!;
    this.open = false;
    this.dispose();
  }

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
      this.cancel();
      throw e;
    }
  }

  private complete() {
    try {
      this.receive(EmitType.Complete);
    } finally {
      this.cancel();
    }
  }

  private error(x: any) {
    try {
      this.receive(EmitType.Error, x);
    } finally {
      this.cancel();
    }
  }

  private dispose() {
    if (this._dispose) {
      const dispose = this._dispose;
      this._dispose = null!;
      dispose();
    }
  }

  private receive: ReceiveForm<T>;
  private _dispose?: Cancel;
  private open: boolean;
}
