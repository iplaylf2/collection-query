import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
  Action,
} from "../../../util";
import AsyncPull from "./async-pull";

export async function* map<T, K>(s: AsyncPull<T>, f: Selector<T, K>) {
  for await (const x of s) {
    yield f(x);
  }
}

export async function* mapAsync<T, K>(s: AsyncPull<T>, f: AsyncSelector<T, K>) {
  for await (const x of s) {
    yield await f(x);
  }
}

export async function* filter<T>(s: AsyncPull<T>, f: Predicate<T>) {
  for await (const x of s) {
    if (f(x)) {
      yield x;
    }
  }
}

export async function* filterAsync<T>(s: AsyncPull<T>, f: AsyncPredicate<T>) {
  for await (const x of s) {
    const p = await f(x);
    if (p) {
      yield x;
    }
  }
}

export async function* remove<T>(s: AsyncPull<T>, f: Predicate<T>) {
  for await (const x of s) {
    if (!f(x)) {
      yield x;
    }
  }
}

export async function* removeAsync<T>(s: AsyncPull<T>, f: AsyncPredicate<T>) {
  for await (const x of s) {
    const p = await f(x);
    if (!p) {
      yield x;
    }
  }
}

export async function* take<T>(s: AsyncPull<T>, n: number) {
  for await (const x of s) {
    if (n > 0) {
      n--;
      yield x;
    } else {
      break;
    }
  }
}

export async function* takeWhile<T>(s: AsyncPull<T>, f: Predicate<T>) {
  for await (const x of s) {
    if (f(x)) {
      yield x;
    } else {
      break;
    }
  }
}

export async function* takeWhileAsync<T>(
  s: AsyncPull<T>,
  f: AsyncPredicate<T>
) {
  for await (const x of s) {
    const p = await f(x);
    if (p) {
      yield x;
    } else {
      break;
    }
  }
}

export async function* skip<T>(s: AsyncPull<T>, n: number) {
  const i = s[Symbol.asyncIterator]();
  while (true) {
    if (n > 0) {
      const { done } = await i.next();
      if (done) {
        break;
      } else {
        n--;
      }
    } else {
      break;
    }
  }
  yield* i;
}

export async function* skipWhile<T>(s: AsyncPull<T>, f: Predicate<T>) {
  const i = s[Symbol.asyncIterator]();
  while (true) {
    const { value, done } = await i.next();
    if (done || !f(value)) {
      break;
    }
  }
  yield* i;
}

export async function* skipWhileAsync<T>(
  s: AsyncPull<T>,
  f: AsyncPredicate<T>
) {
  const i = s[Symbol.asyncIterator]();
  while (true) {
    const { value, done } = await i.next();
    const p = await f(value);
    if (done || !p) {
      break;
    }
  }
  yield* i;
}

export async function* concat<T>(s1: AsyncPull<T>, s2: AsyncPull<T>) {
  for await (const x of s1) {
    yield x;
  }
  for await (const x of s2) {
    yield x;
  }
}

export async function* zip<T>(ss: AsyncPull<T>[]) {
  const ii = ss.map((s) => s[Symbol.asyncIterator]());

  while (true) {
    const iiResult = await Promise.all(ii.map((i) => i.next()));
    const done = iiResult.some(({ done }) => done);
    if (done) {
      break;
    } else {
      const result: T[] = iiResult.map(({ value }) => value);
      yield result;
    }
  }
}

enum RaceStatus {
  Next,
  Pending,
  Race,
  Done,
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
    let race: Action<[boolean, T]>,
      racing = true;

    const rasePromise = new Promise<[boolean, T]>(
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
                  race([true] as any);
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
