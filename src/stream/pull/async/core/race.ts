import AsyncPull from "../async-pull";
import { Action } from "../../../../type";
import { IterateItem } from "../../type";

export async function* race<T>(ss: AsyncPull<T>[]) {
  const dispatcher = new RaceDispatcher<T>(ss.length);

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

    yield x;
  }
}

class RaceDispatcher<T> {
  static startRound<T>(dispatcher: RaceDispatcher<T>, start: () => void) {
    const roundResult = new Promise<IterateItem<T>>(
      (resolve) => (dispatcher.dispatch = resolve)
    );

    dispatcher.idle = true;
    start();

    return roundResult;
  }

  constructor(total: number) {
    this.count = total;
    this.prepareRound();
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

  private prepareRound() {
    this.roundStart = new Promise(
      (resolve) =>
        (this.startRound = () => RaceDispatcher.startRound(this, resolve))
    );
  }

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
      if (this.idle) {
        break;
      }
    }
    this.idle = false;
  }

  private async race(x: T) {
    await this.costRound();
    this.dispatch([false, x]);
    this.prepareRound();
  }

  private dispatch!: Action<IterateItem<T>>;
  private count: number;
  private roundStart!: Promise<any>;
  private idle!: boolean;
}
