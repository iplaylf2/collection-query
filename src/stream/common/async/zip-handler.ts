import { ControlledIterator, IteratorStatus } from "./controlled-iterator";
import { AsyncBlock } from "../../../async-block";

export class ZipHandler<T> extends ControlledIterator<T[]> {
  constructor(total: number) {
    super();
    this.total = total;
    this.count = 0;
    this.content = new Array(total);
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

  protected beforeNext() {
    if (this.count === 0) {
      this.zipBlock.unblock();
    }
  }

  protected onDispose(): void {
    this.zipBlock.unblock();
  }

  private readonly total: number;
  private count: number;
  private content: T[];
  private readonly zipBlock: AsyncBlock;
}
