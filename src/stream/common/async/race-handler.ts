import { Channel } from "../../../channel";
import { Action } from "../../../type";

enum RaceHandlerStatus {
  Running,
  End,
  Crash,
}

class RaceHandler<T> implements AsyncIterableIterator<T> {
  constructor(total: number) {
    this.count = total;
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

  async race(x: T) {
    if (this.status === RaceHandlerStatus.Running) {
      this.channel.put(x);
      do {
        await this.raceBlock;
      } while (this.channel.getLength() > 0);
    }
  }

  leave() {
    if (this.count !== 0) {
      this.count--;
      if (this.count === 0) {
        this.end();
      }
    }
  }

  end() {
    this.count === 0;
    this.channel.close();
    this.unblockRace();
    this.status = RaceHandlerStatus.End;
  }

  crash(error: any) {
    if (this.status === RaceHandlerStatus.Running) {
      this.error = error;
      this.count === 0;
      this.channel.close();
      this.unblockRace();
      this.status = RaceHandlerStatus.Crash;
    }
  }

  private blockRace() {
    this.raceBlock = new Promise((r) => (this.unblockRace = r));
  }

  private unblockRace!: Action<void>;

  private status: RaceHandlerStatus;
  private error: any;
  private count: number;
  private channel: Channel<T>;
  private raceBlock!: Promise<void>;
}
