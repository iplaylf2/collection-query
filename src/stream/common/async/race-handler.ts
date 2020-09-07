import { Channel } from "../../../channel";
import { Action } from "../../../type";

export enum RaceHandlerStatus {
  Running,
  End,
  Crash,
}

export class RaceHandler<T> implements AsyncIterableIterator<T> {
  constructor() {
    this.channel = new Channel();

    this.status = RaceHandlerStatus.Running;
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    return this;
  }

  async next(): Promise<IteratorResult<T, any>> {
    const [, x] = await this.channel.take();

    switch (this.status) {
      case RaceHandlerStatus.Running:
        if (this.channel.getLength() === 0) {
          this.unblockRace();
        }

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
    this.unblockRace();
    this.status = RaceHandlerStatus.End;
  }

  crash(error: any) {
    if (this.status === RaceHandlerStatus.Running) {
      this.error = error;
      this.channel.close();
      this.unblockRace();
      this.status = RaceHandlerStatus.Crash;
    }
  }

  getStatus() {
    return this.status;
  }

  async race(x: T) {
    if (this.status === RaceHandlerStatus.Running) {
      this.channel.put(x);
      while (true) {
        await this.raceBlock;

        if (this.channel.getLength() === 0) {
          return;
        }

        this.blockRace();
      }
    }
  }

  private blockRace() {
    this.raceBlock = new Promise((r) => (this.unblockRace = r));
  }

  private unblockRace!: Action<void>;

  private status: RaceHandlerStatus;
  private error: any;
  private channel: Channel<T>;
  private raceBlock!: Promise<void>;
}
