import AsyncPull from "../async-pull";
import { Action } from "../../../../type";
import { IterateItem } from "../../type";

export async function* race<T>(ss: AsyncPull<T>[]) {
  if (ss.length === 0) {
    return;
  }

  const ii = ss.map((s) => s[Symbol.asyncIterator]());
  const dispatcher = new RaceDispatcher<T>(ii);

  while (true) {
    const [done, x] = await dispatcher.startRound();
    if (done) {
      return;
    }

    yield x as T;
  }
}

class RaceDispatcher<T> {
  static startRound<T>(dispatcher: RaceDispatcher<T>, start: () => void) {
    let handleResult!: Action<IterateItem<T>>, handleError!: Action<any>;
    const roundResult = new Promise<IterateItem<T>>(
      (resolve, reject) => ((handleResult = resolve), (handleError = reject))
    );

    dispatcher.setRoundResult = handleResult;
    dispatcher.setRoundError = handleError;
    dispatcher.idle = true;
    start();

    return roundResult;
  }

  constructor(ii: AsyncIterableIterator<T>[]) {
    this.prepareRound();
    this.joinAll(ii);
  }

  startRound!: () => Promise<IterateItem<T>>;

  private joinAll(ii: AsyncIterableIterator<T>[]) {
    this.count = ii.length;
    for (const i of ii) {
      this.join(i);
    }
  }

  private async join(i: AsyncIterableIterator<T>) {
    while (true) {
      let x: IteratorResult<T>;
      try {
        x = await i.next();
      } catch (e) {
        this.crash(e);
        throw e;
      }

      const { done, value } = x;
      if (done) {
        this.leave();
        return;
      }

      await this.race(value);
    }
  }

  private prepareRound() {
    let handle: () => void;
    this.roundStart = new Promise((resolve) => (handle = resolve));
    this.startRound = () => RaceDispatcher.startRound(this, handle);
  }

  private async crash(e: any) {
    await this.costRound();
    this.setRoundError(e);
  }

  private async leave() {
    this.count--;
    if (this.count === 0) {
      await this.costRound();
      this.setRoundResult([true]);
    }
  }

  private async costRound() {
    while (true) {
      await this.roundStart;
      if (this.idle) {
        break;
      }
    }
    this.idle = false;
    this.prepareRound();
  }

  private async race(x: T) {
    await this.costRound();
    this.setRoundResult([false, x]);
  }

  private setRoundResult!: Action<IterateItem<T>>;
  private setRoundError!: Action<any>;

  private count!: number;
  private roundStart!: Promise<any>;
  private idle!: boolean;
}
