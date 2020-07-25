import { Func, Action } from "../../../../type";
import { IterateItem } from "../../type";

export async function* zip<T>(ss: Func<AsyncIterableIterator<T>>[]) {
  if (ss.length === 0) {
    return;
  }

  const ii = ss.map((s) => s());
  const zipCollector = new ZipCollector(ii);

  while (true) {
    const [done, x] = await zipCollector.startRound();
    if (done) {
      return;
    }

    yield x as T[];
  }
}

class ZipCollector<T> {
  constructor(ii: AsyncIterableIterator<T>[]) {
    this.ii = ii;
    this.total = ii.length;
    this.close = false;
  }

  startRound() {
    let handleResult!: Action<IterateItem<T[]>>, handleError!: Action<any>;
    const roundResult = new Promise<IterateItem<T[]>>(
      (resolve, reject) => ((handleResult = resolve), (handleError = reject))
    );

    this.setRoundResult = handleResult;
    this.setRoundError = handleError;
    this.count = 0;

    let index = 0;
    for (const _ of this.ii) {
      this.collect(index);
      index++;
    }

    return roundResult;
  }

  private async collect(index: number) {
    let x: IteratorResult<T>;
    try {
      x = await this.ii[index].next();
    } catch (e) {
      this.crash(e);
      throw e;
    }

    const { done, value } = x;
    if (done) {
      this.over();
      return;
    }

    this.zip(index, value);
  }

  private crash(e: any) {
    if (this.close) {
      return;
    }

    this.close = true;
    this.setRoundError(e);
  }

  private over() {
    if (this.close) {
      return;
    }

    this.close = true;
    this.setRoundResult([true]);
  }

  private zip(index: number, x: T) {
    if (this.close) {
      return;
    }

    this.zipContent[index] = x;
    this.count++;
    if (this.count === this.total) {
      this.setRoundResult([false, this.zipContent]);
    }
  }

  private setRoundResult!: Action<IterateItem<T[]>>;
  private setRoundError!: Action<any>;

  private readonly ii!: AsyncIterableIterator<T>[];
  private readonly total!: number;
  private readonly zipContent!: T[];
  private close!: boolean;
  private count!: number;
}
