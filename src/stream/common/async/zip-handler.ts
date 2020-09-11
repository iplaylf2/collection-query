import { ControlledIterator, IteratorStatus } from "./controlled-iterator";
import { AsyncBlock } from "../../../async-tool/async-block";
import { Channel } from "../../../async-tool/channel";

export class ZipHandler<T> extends ControlledIterator<T[]> {
  constructor(total: number) {
    super();
    this.total = total;
    this.count = 0;
    this.content = new Array(total);
    this.channel = new Channel();
    this.zipBlock = new AsyncBlock();
  }

  async zip(i: number, x: T) {
    if (this.status === IteratorStatus.Running) {
      if (this.count === 0) {
        this.zipBlock.block();
      }

      this.count++;
      this.content[i] = x;

      if (this.count === this.total) {
        this.count = 0;

        await this.channel.put(this.content);
      }

      await this.zipBlock.wait;

      return this.status === IteratorStatus.Running;
    } else {
      return false;
    }
  }

  protected async getNext(): Promise<T[]> {
    if (this.count === 0) {
      this.zipBlock.unblock();
    }

    const [, x] = await this.channel.take();
    return x!;
  }

  protected onDispose(): void {
    this.zipBlock.unblock();
  }

  private readonly total: number;
  private count: number;
  private content: T[];
  private readonly channel: Channel<T[]>;
  private readonly zipBlock: AsyncBlock;
}
