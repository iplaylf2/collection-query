import AsyncPull from "../async-pull";
import { Action } from "../../../../type";
import { IterateItem } from "../../type";

export async function* race<T>(ss: AsyncPull<T>[]) {
  const raceContext = new RaceContext<T>(ss.length);
  let startRound: Action<Action<IterateItem<T>>>;
  raceContext.roundStart = new Promise((resolve) => (startRound = resolve));

  const ii = ss.map((s) => s[Symbol.asyncIterator]());
  for (const i of ii) {
    raceContext.join(i);
  }

  while (true) {
    raceContext.isRoundEnd = false;
    raceContext.round = new Promise((resolve) => startRound(resolve));

    const [done, x] = await raceContext.round;
    if (done) {
      return;
    }

    yield x;

    raceContext.roundStart = new Promise((resolve) => (startRound = resolve));
  }
}

class RaceContext<T> {
  constructor(total: number) {
    this.count = total;
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

  leave() {
    this.count--;
    if (this.count === 0) {
      this.raceResolve([true]);
    }
  }

  async race(x: T) {
    while (true) {
      this.raceResolve = await this.roundStart;
      if (this.isRoundEnd) {
        await this.round;
      } else {
        this.isRoundEnd = true;
        break;
      }
    }

    this.raceResolve([false, x]);
  }

  raceResolve!: Action<IterateItem<T>>;
  roundStart!: Promise<Action<IterateItem<T>>>;
  isRoundEnd!: boolean;
  round!: Promise<any>;

  private count: number;
}
