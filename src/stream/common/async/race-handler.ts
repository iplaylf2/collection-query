import { ControlledIterator, IteratorStatus } from "./controlled-iterator";
import { LazyChannel } from "../../../async-tool/lazy-channel";

export class RaceHandler<T> extends ControlledIterator<T> {
  constructor(total: number) {
    super();
    this.count = total;
    this.channel = new LazyChannel();
  }

  async race(x: T) {
    if (this.status === IteratorStatus.Running) {
      await this.channel.put(x);

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
    const [, x] = await this.channel.take();
    return x!;
  }

  protected onDispose(): void {
    this.channel.close();
  }

  private count: number;
  private readonly channel: LazyChannel<T>;
}
