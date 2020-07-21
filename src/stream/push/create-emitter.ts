import { Action } from "../../type";
import { EmitForm, EmitItem, EmitType } from "./type";

export function createEmitter<T, Te>(executor: Action<EmitForm<T, Te>>) {
  return function (receiver: EmitForm<T, Te>) {
    const handler = new EmitterHandler(receiver);
    handler.start(executor);

    const cancel = handler.cancel.bind(handler);
    return cancel;
  };
}

class EmitterHandler<T, Te> {
  constructor(emit: EmitForm<T, Te>) {
    this.emit = emit;
    this.open = true;
  }

  async start(executor: Action<EmitForm<T, Te>>) {
    await Promise.resolve();

    const receiver = this.handle.bind(this);
    try {
      executor(receiver);
    } catch {
      this.cancel();
    }
  }

  cancel() {
    this.emit = null!;
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
      this.emit(EmitType.Next, x);
    } catch (e) {
      this.cancel();
      throw e;
    }
  }

  private complete() {
    const emit = this.emit;
    this.cancel();
    emit(EmitType.Complete);
  }

  private error(x: Te) {
    const emit = this.emit;
    this.cancel();
    emit(EmitType.Error, x);
  }

  private emit: EmitForm<T, Te>;

  private open: boolean;
}
