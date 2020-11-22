import { Action } from "../../../type";
import { EmitForm, Emitter } from "./type";
import { EmitItem, EmitType } from "../type";
import { Channel } from "../../../async-tool/channel";

export function create<T, Te = never>(
  executor: Action<EmitForm<T, Te>>
): Emitter<T, Te> {
  return (receiver: EmitForm<T, Te>) => {
    const handler = new EmitterHandler(receiver);
    handler.start(executor);

    const cancel = handler.cancel.bind(handler);
    return cancel;
  };
}

class EmitterHandler<T, Te> {
  constructor(receiver: EmitForm<T, Te>) {
    this.receive = receiver;
    this.queueChannel = new Channel(1);
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
    this.receive = null!;
    this.open = false;
    this.queueChannel.close();
  }

  private async handle(...item: EmitItem<T, Te>) {
    await this.queueChannel.put();

    await this.handleReceive(...item);

    await this.queueChannel.take();
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

  private error(x: Te) {
    const receive = this.receive;
    this.cancel();
    receive(EmitType.Error, x);
  }

  private receive: EmitForm<T, Te>;
  private readonly queueChannel: Channel<void>;
  private open: boolean;
}
