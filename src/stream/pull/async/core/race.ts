import AsyncPull from "../async-pull";
import { Action } from "../../../../type";
import { IterateItem } from "../../type";

export async function* race<T>(ss: AsyncPull<T>[]) {
  const dispatcher = new RaceDispatcher<T>(ss.length);

  dispatcher.prepareRound();

  const ii = ss.map((s) => s[Symbol.asyncIterator]());
  for (const i of ii) {
    dispatcher.join(i);
  }

  while (true) {
    const roundResult = dispatcher.startRound();

    const [done, x] = await roundResult;
    if (done) {
      return;
    }

    dispatcher.prepareRound();

    yield x;
  }
}

class RaceDispatcher<T> {
  static startRound<T>(dispatcher: RaceDispatcher<T>, start: () => void) {
    dispatcher.roundResult = new Promise(
      (resolve) => (dispatcher.dispatch = resolve)
    );
    dispatcher.isRoundEnd = false;
    start();

    return dispatcher.roundResult;
  }

  constructor(total: number) {
    this.count = total;
  }

  prepareRound() {
    this.roundStart = new Promise(
      (resolve) =>
        (this.startRound = () => RaceDispatcher.startRound(this, resolve))
    );
  }

  async join(i: AsyncIterableIterator<T>) {
    while (true) {
      const { done, value } = await i.next();
      if (done) {
        this.leave();
        return;
      }

      await this.race(value);
    }
  }

  startRound!: () => Promise<IterateItem<T>>;

  private async leave() {
    this.count--;
    if (this.count === 0) {
      await this.costRound();
      this.dispatch([true]);
    }
  }

  private async costRound() {
    while (true) {
      await this.roundStart;
      if (this.isRoundEnd) {
        await this.roundResult;
      } else {
        this.isRoundEnd = true;
        return;
      }
    }
  }

  private async race(x: T) {
    await this.costRound();
    this.dispatch([false, x]);
  }

  private dispatch!: Action<IterateItem<T>>;
  private count: number;
  private roundStart!: Promise<any>;
  private roundResult!: Promise<IterateItem<T>>;
  private isRoundEnd!: boolean;
}
