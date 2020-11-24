import { Action } from "../../../type";
import { EmitForm, Emitter } from "./type";
import { EmitItem, EmitType } from "../type";

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

    this.lastBlock = Promise.resolve();
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

  private async handle(...item: EmitItem<T, Te>) {
    let resolve!: Action<void>;
    const new_block = new Promise<void>((r) => (resolve = r));

    const last_block = this.lastBlock;
    this.lastBlock = new_block;

    await last_block;

    try {
      await this.handleReceive(...item);
    } finally {
      resolve();
    }
  }

  private async handleReceive(...[t, x]: EmitItem<T, Te>) {
    if (this.open) {
      switch (t) {
        case EmitType.Next:
          await this.next(x as T);
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

  private async next(x: T) {
    try {
      await this.receive(EmitType.Next, x);
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
  private lastBlock: Promise<void>;
}
