import {
  Cancel,
  EmitItem,
  Emitter,
  EmitType,
  Executor,
  ReceiveForm,
} from "./type";

export function create<T>(executor: Executor<T>): Emitter<T> {
  return (receiver, expose) => {
    const handler = new EmitterHandler(receiver);
    const cancel = handler.cancel.bind(handler);

    if (expose) {
      expose(cancel);
    }
    handler.start(executor);

    return cancel;
  };
}

class EmitterHandler<T> {
  constructor(receiver: ReceiveForm<T>) {
    this.receive = receiver;
    this.open = true;
  }

  start(executor: Executor<T>) {
    const receiver = this.handle.bind(this);
    try {
      this.dispose = executor(receiver);
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
    if (this.dispose) {
      const dispose = this.dispose;
      this.dispose = null!;
      dispose();
    }
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

  private receive: ReceiveForm<T>;

  private open: boolean;
  private dispose?: Cancel;
}
