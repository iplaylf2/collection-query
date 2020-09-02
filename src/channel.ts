import { Action } from "./type";

export enum ChannelStatus {
  Unloaded,
  Loaded,
  Closed,
  Clean,
}

export class Channel<T> {
  constructor() {
    this.blockTake();
    this.status = ChannelStatus.Unloaded;
  }

  async put(x: T) {
    begin: switch (this.status) {
      case ChannelStatus.Unloaded:
        this.content = x;
        this.unblockTake();
        this.blockPut();

        this.status = ChannelStatus.Loaded;
        break;
      case ChannelStatus.Loaded:
        await this.putBlock;
        break begin;
      case ChannelStatus.Closed:
      case ChannelStatus.Clean:
        break;
    }
  }

  async take(): Promise<[true] | [false, T]> {
    begin: switch (this.status) {
      case ChannelStatus.Unloaded:
        await this.takeBlock;
        break begin;
      case ChannelStatus.Loaded: {
        const x = this.content;
        this.content = null!;
        this.unblockPut();
        this.blockTake();

        this.status = ChannelStatus.Unloaded;

        return [false, x];
      }
      case ChannelStatus.Closed: {
        const x = this.content;
        this.content = null!;

        this.status = ChannelStatus.Clean;

        return [false, x];
      }
      case ChannelStatus.Clean:
        return [true];
    }
    throw "never";
  }

  close() {
    switch (this.status) {
      case ChannelStatus.Unloaded:
        this.unblockTake();
        this.status = ChannelStatus.Clean;
        break;
      case ChannelStatus.Loaded:
        this.unblockPut();
        this.status = ChannelStatus.Closed;
        break;
      case ChannelStatus.Closed:
      case ChannelStatus.Clean:
        break;
    }
  }

  getStatus() {
    return this.status;
  }

  private blockPut() {
    this.putBlock = new Promise((r) => (this.unblockPut = r));
  }

  private blockTake() {
    this.takeBlock = new Promise((r) => (this.unblockTake = r));
  }

  private unblockPut!: Action<void>;
  private unblockTake!: Action<void>;

  private status: ChannelStatus;
  private content!: T;
  private putBlock!: Promise<void>;
  private takeBlock!: Promise<void>;
}
