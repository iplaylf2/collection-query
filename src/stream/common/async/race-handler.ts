import { Channel } from "../../../channel";
import { AsyncBlock } from "../../../async-block";

export enum RaceHandlerStatus {
  Running,
  End,
  Crash,
}

export class RaceHandler<T> implements AsyncIterableIterator<T> {
  constructor() {
    this.channel = new Channel();
    this.raceBlock = new AsyncBlock();
    this.status = RaceHandlerStatus.Running;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  async next(): Promise<IteratorResult<T, any>> {
    if (this.channel.getLength() === 0) {
      this.raceBlock.unblock();
    }

    const [, x] = await this.channel.take();

    switch (this.status) {
      case RaceHandlerStatus.Running:
        return { done: false, value: x! };
      case RaceHandlerStatus.End:
        return { done: true, value: undefined };
      case RaceHandlerStatus.Crash:
        this.status = RaceHandlerStatus.End;
        throw this.error;
    }
  }

  async return(): Promise<IteratorResult<T, any>> {
    this.end();
    return { done: true, value: undefined };
  }

  end() {
    this.channel.close();
    this.raceBlock.unblock();
    this.status = RaceHandlerStatus.End;
  }

  crash(error: any) {
    if (this.status === RaceHandlerStatus.Running) {
      this.error = error;
      this.channel.close();
      this.raceBlock.unblock();
      this.status = RaceHandlerStatus.Crash;
    }
  }

  getStatus() {
    return this.status;
  }

  async race(x: T) {
    if (this.status === RaceHandlerStatus.Running) {
      await this.channel.put(x);
      if (this.channel.getLength() === 1) {
        this.raceBlock.block();
      }

      do {
        await this.raceBlock.wait;
      } while (this.channel.getLength() > 0);
    }
  }

  private status: RaceHandlerStatus;
  private error: any;
  private channel: Channel<T>;
  private raceBlock: AsyncBlock;
}
