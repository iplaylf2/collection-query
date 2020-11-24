import { Action } from "../../type";
import { EmitForm, EmitItem, Emitter, EmitType } from "./type";

export function create<T, Te = never>(
  executor: Action<EmitForm<T, Te>>
): Emitter<T, Te> {
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

class EmitterHandler<T, Te> {
  constructor(receiver: EmitForm<T, Te>) {
    this.receive = receiver;
    this.open = true;
  }

  start(executor: Action<EmitForm<T, Te>>) {
    const receiver = this.handle.bind(this);
    try {
      executor(receiver);
    } finally {
      this.cancel();
    }
  }

  cancel() {
    this.receive = null!;
    this.open = false;
  }

  private handle(...[t, x]: EmitItem<T, Te>) {
    if (this.open) {
      switch (t) {
        case EmitType.Next:
          this.next(x as T);
          break;
        case EmitType.Complete:
          this.complete();
          break;
        case EmitType.Error:
          this.error(x as Te);
          break;
      }
    }
  }

  private next(x: T) {
    try {
      this.receive(EmitType.Next, x);
    } finally {
      this.cancel();
    }
  }

  private complete() {
    const receive = this.receive;
    this.cancel();
    receive(EmitType.Complete);
  }

  private error(x: Te) {
    const receive = this.receive;
    this.cancel();
    receive(EmitType.Error, x);
  }

  private receive: EmitForm<T, Te>;

  private open: boolean;
}
