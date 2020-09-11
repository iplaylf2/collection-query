import { ControlledIterator, IteratorStatus } from "./controlled-iterator";
import { AsyncBlock } from "../../../async-tool/async-block";
import { Channel } from "../../../async-tool/channel";

export class RaceHandler<T> extends ControlledIterator<T> {
  constructor(total: number) {
    super();
    this.count = total;
    this.channel = new Channel();
    this.raceBlock = new AsyncBlock();
  }

  async race(x: T) {
    if (this.status === IteratorStatus.Running) {
      await this.channel.put(x);
      if (this.channel.length === 1) {
        this.raceBlock.block();
      }

      do {
        await this.raceBlock.wait;
      } while (this.channel.length > 0);

      return this.status === IteratorStatus.Running;
    } else {
      return false;
    }
  }

  leave() {
    if (this.status === IteratorStatus.Running) {
      this.count--;
      if (!(this.count > 0)) {
        this.end();
      }
    }
  }

  protected async getNext(): Promise<T> {
    if (this.channel.length === 0) {
      this.raceBlock.unblock();
    }

    const [, x] = await this.channel.take();
    return x!;
  }

  protected onDispose(): void {
    this.raceBlock.unblock();
  }

  private count: number;
  private readonly channel: Channel<T>;
  private readonly raceBlock: AsyncBlock;
}
