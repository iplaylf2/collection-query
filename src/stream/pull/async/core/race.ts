import AsyncPull from "../async-pull";
import { Action } from "../../../../type";
import { IterateItem } from "../../type";

enum RaceStatus {
  Next,
  Pending,
  Race,
  Done,
}

interface RaceContext {
  total: number;
  doneCount: number;
}

interface RaceRound<T> {
  racing: boolean;
  race: Action<IterateItem<T>>;
}

class RacePlayer<T> {
  create(ii: AsyncIterableIterator<T>[]) {
    const context = { total: ii.length, doneCount: 0 };
    return ii.map((i) => new RacePlayer(context, i));
  }

  constructor(context: RaceContext, i: AsyncIterableIterator<T>) {
    this.context = context;
    this.i = i;
    this.status = RaceStatus.Next;
    this.p = this.i.next();
  }

  ready(round: RaceRound<T>) {
    switch (this.status) {
      case RaceStatus.Next:
        this.status = RaceStatus.Pending;

        this.p = this.p.then((x) => {
          if (x.done) {
            this.status = RaceStatus.Done;

            this.context.doneCount++;
            if (this.context.doneCount === this.context.total) {
              round.race([true]);
            }

            return x;
          } else {
            this.status = RaceStatus.Race;
            const raceWin = this.race(round, x.value);
            if (raceWin) {
              return this.i.next();
            } else {
              return x;
            }
          }
        });
        break;
      case RaceStatus.Pending:
        break;
      case RaceStatus.Race:
        const raceWin = this.race(round, this.value as T);
        if (raceWin) {
          this.p = this.i.next();
        }
        break;
      case RaceStatus.Done:
        break;
    }
  }

  race(round: RaceRound<T>, x: T) {
    if (round.racing) {
      round.racing = false;
      round.race([false, x]);

      this.status = RaceStatus.Next;
      return true;
    } else {
      return false;
    }
  }

  context: RaceContext;
  i: AsyncIterableIterator<T>;
  status: RaceStatus;
  p: Promise<IteratorResult<T, T>>;
  value: T | undefined;
}

export async function* race<T>(ss: AsyncPull<T>[]) {
  const ii = ss.map((s) => s[Symbol.asyncIterator]());
  let pp: [
    {
      iterator: AsyncIterableIterator<T>;
      status: RaceStatus;
    },
    Promise<IteratorResult<T, T>>
  ][] = ii.map((i) => [
    {
      iterator: i,
      status: RaceStatus.Next,
    },
    i.next(),
  ]);

  const total = ss.length;
  let doneCount = 0;

  while (true) {
    let race: Action<IterateItem<T>>,
      racing = true;

    const rasePromise = new Promise<IterateItem<T>>(
      (resolve) => (race = resolve)
    );

    pp = pp.map(([o, p]) => {
      const tryRace = function (x: IteratorResult<T, T>) {
        if (racing) {
          racing = false;
          race([false, x.value]);

          o.status = RaceStatus.Next;
          return o.iterator.next();
        } else {
          return x;
        }
      };

      switch (o.status) {
        case RaceStatus.Next:
          o.status = RaceStatus.Pending;

          return [
            o,
            p.then((x) => {
              if (x.done) {
                o.status = RaceStatus.Done;

                doneCount++;
                if (doneCount === total) {
                  race([true]);
                }

                return x;
              } else {
                o.status = RaceStatus.Race;

                return tryRace(x);
              }
            }),
          ];
        case RaceStatus.Pending:
          return [o, p];
        case RaceStatus.Race:
          return [o, p.then(tryRace)];
        case RaceStatus.Done:
          return [o, p];
      }
    });

    const [done, value] = await rasePromise;

    if (done) {
      break;
    } else {
      yield value;
    }
  }
}
