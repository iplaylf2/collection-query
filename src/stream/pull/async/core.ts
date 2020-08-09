import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
  Func,
} from "../../../type";
import { PartitionCollector } from "../../common/partition-collector";
import { AsyncPartitionByCollector } from "../../common/partition-by-collector/async-partition-by-collector";
import {
  ZipCollector,
  ZipCollectorStatus,
} from "../../common/async/zip-collector";
import {
  RaceDispatcher,
  RaceDispatcherStatus,
} from "../../common/async/race-dispatcher";

export async function* map<T, K>(
  iterator: AsyncIterableIterator<T>,
  f: Selector<T, K> | AsyncSelector<T, K>
) {
  for await (const x of iterator) {
    yield await f(x);
  }
}

export async function* filter<T>(
  iterator: AsyncIterableIterator<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  for await (const x of iterator) {
    const p = await f(x);
    if (p) {
      yield x;
    }
  }
}

export async function* remove<T>(
  iterator: AsyncIterableIterator<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  for await (const x of iterator) {
    const p = await f(x);
    if (!p) {
      yield x;
    }
  }
}

export async function* take<T>(iterator: AsyncIterableIterator<T>, n: number) {
  for await (const x of iterator) {
    if (n > 0) {
      n--;
      yield x;
    } else {
      break;
    }
  }
}

export async function* takeWhile<T>(
  iterator: AsyncIterableIterator<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  for await (const x of iterator) {
    const p = await f(x);
    if (p) {
      yield x;
    } else {
      break;
    }
  }
}

export async function* skip<T>(iterator: AsyncIterableIterator<T>, n: number) {
  while (true) {
    if (n > 0) {
      const { done } = await iterator.next();
      if (done) {
        break;
      } else {
        n--;
      }
    } else {
      break;
    }
  }
  yield* iterator;
}

export async function* skipWhile<T>(
  iterator: AsyncIterableIterator<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  while (true) {
    const { value, done } = await iterator.next();
    const p = await f(value);
    if (done || !p) {
      break;
    }
  }
  yield* iterator;
}

export async function* partition<T>(
  iterator: AsyncIterableIterator<T>,
  n: number
) {
  const collector = new PartitionCollector<T>(n);

  for await (const x of iterator) {
    const [full, partition] = collector.collect(x);
    if (full) {
      yield partition!;
    }
  }

  const [rest, partition] = collector.getRest();
  if (rest) {
    yield partition!;
  }
}

export async function* partitionBy<T>(
  iterator: AsyncIterableIterator<T>,
  f: Predicate<T>
) {
  const collector = new AsyncPartitionByCollector<T>(f);

  for await (const x of iterator) {
    const [full, partition] = await collector.collect(x);
    if (full) {
      yield partition!;
    }
  }

  const [rest, partition] = collector.getRest();
  if (rest) {
    yield partition!;
  }
}

export async function* concat<T>(
  s1: Func<AsyncIterableIterator<T>>,
  s2: Func<AsyncIterableIterator<T>>
) {
  for await (const x of s1()) {
    yield x;
  }
  for await (const x of s2()) {
    yield x;
  }
}

export async function* zip<T>(ss: Func<AsyncIterableIterator<T>>[]) {
  const total = ss.length;
  if (!(total > 0)) {
    return;
  }

  const collector = new ZipCollector<T>(total);

  let index = 0;
  ss.map((s) => [s(), index++] as [AsyncIterableIterator<T>, number]).forEach(
    async ([i, index]) => {
      while (true) {
        try {
          var { done, value } = await i.next();
        } catch (e) {
          collector.crash(e);
          return;
        }

        switch (collector.getStatus()) {
          case ZipCollectorStatus.Active:
            break;
          default:
            return;
        }

        if (done) {
          break;
        }

        await collector.zip(index, value);
      }

      collector.leave();
    }
  );

  while (true) {
    const [done, x] = await collector.next();
    if (done) {
      break;
    }

    yield x!;
  }
}

export async function* race<T>(ss: Func<AsyncIterableIterator<T>>[]) {
  const total = ss.length;
  if (!(total > 0)) {
    return;
  }

  const dispatcher = new RaceDispatcher<T>(total);

  ss.map((s) => s()).forEach(async (i) => {
    while (true) {
      try {
        var { done, value } = await i.next();
      } catch (e) {
        dispatcher.crash(e);
        return;
      }

      if (dispatcher.getStatus() === RaceDispatcherStatus.Crash) {
        return;
      }

      if (done) {
        break;
      }

      await dispatcher.race(value);
    }

    dispatcher.leave();
  });

  while (true) {
    const [done, x] = await dispatcher.next();
    if (done) {
      break;
    }

    yield x!;
  }
}
