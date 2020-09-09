import { ControlledIterator, IteratorStatus } from "./controlled-iterator";
import { AsyncBlock } from "../../../async-block";

export class RaceHandler<T> extends ControlledIterator<T> {
  constructor() {
    super();
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

  protected beforeNext() {
    if (this.channel.length === 0) {
      this.raceBlock.unblock();
    }
  }

  protected onDispose(): void {
    this.raceBlock.unblock();
  }

  private readonly raceBlock: AsyncBlock;
}
