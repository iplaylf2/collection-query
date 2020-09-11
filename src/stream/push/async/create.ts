import { Action } from "../../../type";
import { EmitForm } from "./type";
import { EmitItem, EmitType } from "../type";

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
    this.queueBlock = new QueueBlock();
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
    this.queueBlock.dequeueAll();
  }

  private async handle(...item: EmitItem<T, Te>) {
    const dequeue = await this.queueBlock.enqueue();

    await this.handleReceive(...item);

    dequeue();
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
  private queueBlock: QueueBlock;
  private open: boolean;
}

class QueueBlock {
  constructor() {
    this.linkDequeueHead = {} as any;
    this.linkDequeueTail = this.linkDequeueHead;
  }

  async enqueue(): Promise<Action<void>> {
    const last_block = this.lastBlock;

    let dequeue!: Action<void>;
    this.lastBlock = new Promise((r) => {
      const node = { value: r };

      dequeue = () => {
        const current = this.linkDequeueHead.next;
        if (current === node) {
          this.linkDequeueHead.next = current.next;
          if (this.linkDequeueTail === node) {
            this.linkDequeueTail = this.linkDequeueHead;
          }
          r();
        }
      };

      this.linkDequeueTail.next = node;
      this.linkDequeueTail = node;
    });

    await last_block;

    return dequeue;
  }

  dequeueAll() {
    let current = this.linkDequeueHead.next;
    while (current) {
      current.value();
      current = current.next;
    }
    this.linkDequeueTail = this.linkDequeueHead;
  }

  private lastBlock!: Promise<void>;
  private linkDequeueHead: LinkNode<Action<void>>;
  private linkDequeueTail: LinkNode<Action<void>>;
}

interface LinkNode<T> {
  value: T;
  next?: LinkNode<T>;
}
