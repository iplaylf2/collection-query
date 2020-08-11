import { AsyncPushStream, AsyncPullStream } from "../type";
import { EmitType } from "../push/type";
import { IterateItem } from "../pull/type";
import { Action } from "../../type";

export function pull<T>(s: AsyncPushStream<T>): AsyncPullStream<T> {
  return async function* () {
    const handler = new RelayHandler<T>();

    s(async (t, x?) => {
      switch (t) {
        case EmitType.Next:
          await handler.relay(x as T);
          break;
        case EmitType.Complete:
          handler.done();
          break;
        case EmitType.Error:
          handler.crash(x);
          break;
      }
    });

    while (true) {
      const [done, value] = await handler.next();

      if (done) {
        break;
      }

      yield value!;
    }
  };
}

class RelayHandler<T> {
  constructor() {
    this.pending();
  }

  async relay(x: T) {
    begin: switch (this.status) {
      case RelayHandlerStatus.Active:
        this.setNextResult([false, x]);
        this.pending();
        return this.blockPromise;
      case RelayHandlerStatus.Pending:
        await this.blockPromise;
        break begin;
      case RelayHandlerStatus.End:
        break;
      case RelayHandlerStatus.Crash:
        this.alreadyCrash();
    }
  }

  done() {
    switch (this.status) {
      case RelayHandlerStatus.Active:
        this.status = RelayHandlerStatus.End;
        this.setNextResult([true]);
        break;
      case RelayHandlerStatus.Pending:
        this.status = RelayHandlerStatus.End;
        break;
      case RelayHandlerStatus.End:
        break;
      case RelayHandlerStatus.Crash:
        this.alreadyCrash();
    }
  }

  crash(e: any) {
    switch (this.status) {
      case RelayHandlerStatus.Active:
        this.status = RelayHandlerStatus.Crash;
        this.setNextError(e);
        break;
      case RelayHandlerStatus.Pending:
        this.status = RelayHandlerStatus.Crash;
        this.error = e;
        break;
      case RelayHandlerStatus.End:
        break;
      case RelayHandlerStatus.Crash:
        this.alreadyCrash();
    }
  }

  async next(): Promise<IterateItem<T>> {
    switch (this.status) {
      case RelayHandlerStatus.Active:
        throw "never";
      case RelayHandlerStatus.Pending:
        this.status = RelayHandlerStatus.Active;
        this.nextPromise = new Promise(
          (resolve, reject) => (
            (this.setNextResult = resolve), (this.setNextError = reject)
          )
        );
        this.unblock();

        return this.nextPromise;
      case RelayHandlerStatus.End:
        return [true];
      case RelayHandlerStatus.Crash:
        throw this.error;
    }
  }

  private pending() {
    this.status = RelayHandlerStatus.Pending;
    this.blockPromise = new Promise((resolve) => (this.unblock = resolve));
  }

  private alreadyCrash(): never {
    throw "already crash";
  }

  private unblock!: Action<void>;
  private setNextResult!: Action<IterateItem<T>>;
  private setNextError!: Action<any>;

  private status!: RelayHandlerStatus;
  private error: any;
  private blockPromise!: Promise<void>;
  private nextPromise!: Promise<IterateItem<T>>;
}

enum RelayHandlerStatus {
  Active,
  Pending,
  End,
  Crash,
}
