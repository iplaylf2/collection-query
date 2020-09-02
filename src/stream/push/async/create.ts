import { Action } from "../../../type";
import { EmitForm } from "./type";
import { EmitItem, EmitType } from "../type";
import { Channel } from "../../../channel";

export function create<T, Te = never>(executor: Action<EmitForm<T, Te>>) {
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
    this.open = true;
    this.channel = new Channel();
  }

  async start(executor: Action<EmitForm<T, Te>>) {
    await Promise.resolve();

    const receiver: EmitForm<T, Te> = (t, x?) =>
      this.channel.put([t, x] as any);

    (async () => {
      while (true) {
        const [done, x] = await this.channel.take();
        if (done) {
          break;
        }

        await this.handle(...x!);
      }
    })();

    try {
      executor(receiver);
    } catch {
      this.cancel();
    }
  }

  cancel() {
    this.receive = null!;
    this.open = false;
    this.channel.close();
  }

  private async handle(...[t, x]: EmitItem<T, Te>) {
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

  private open: boolean;
  private channel: Channel<EmitItem<T, Te>>;
}
