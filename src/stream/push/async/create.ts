import { Action } from "../../../type";
import { ReceiveForm, Emitter, Executor } from "./type";
import { EmitItem, EmitType } from "../type";

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

    this.lastBlock = Promise.resolve();
  }

  start(executor: Executor<T>) {
    const receiver = this.handle.bind(this);
    try {
      executor(receiver);
    } catch (e) {
      this.error(e);
    }
  }

  cancel() {
    this.receive = null!;
    this.open = false;
  }

  private async handle(...item: EmitItem<T>) {
    let resolve!: Action<void>;
    const new_block = new Promise<void>((r) => (resolve = r));

    const last_block = this.lastBlock;
    this.lastBlock = new_block;

    await last_block;

    try {
      return await this.handleReceive(...item);
    } finally {
      resolve();
    }
  }

  private async handleReceive(...[t, x]: EmitItem<T>) {
    if (this.open) {
      switch (t) {
        case EmitType.Next:
          await this.next(x);
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

  private async next(x: T) {
    try {
      await this.receive(EmitType.Next, x);
    } catch (e) {
      this.cancel();
      throw e;
    }
  }

  private complete() {
    const receive = this.receive;
    this.cancel();
    receive(EmitType.Complete);
  }

  private error(x: any) {
    const receive = this.receive;
    this.cancel();
    receive(EmitType.Error, x);
  }

  private receive: ReceiveForm<T>;
  private open: boolean;
  private lastBlock: Promise<void>;
}
