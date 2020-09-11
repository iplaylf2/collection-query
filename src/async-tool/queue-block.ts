import { Action } from "../type";

export class QueueBlock {
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
