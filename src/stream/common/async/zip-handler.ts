import { ControlledIterator, IteratorStatus } from "./controlled-iterator";
import { AsyncBlock } from "../../../async-tool/async-block";
import { LazyChannel } from "../../../async-tool/lazy-channel";

export class ZipHandler<T> extends ControlledIterator<T[]> {
  constructor(total: number) {
    super();
    this.total = total;
    this.count = 0;
    this.content = new Array(total);
    this.channel = new LazyChannel();
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
        this.zipBlock.unblock();
      } else {
        await this.zipBlock.wait;
      }
    }
  }

  protected async getNext(): Promise<T[]> {
    const [, x] = await this.channel.take();
    return x!;
  }

  protected onDispose(): void {
    this.channel.close();
    this.zipBlock.unblock();
  }

  private readonly total: number;
  private count: number;
  private readonly content: T[];
  private readonly channel: LazyChannel<T[]>;
  private readonly zipBlock: AsyncBlock;
}
