import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
  Func,
} from "../../../type";
import { PartitionCollector } from "../../common/partition-collector";
import { AsyncPartitionByCollector } from "../../common/partition-by-collector/async-partition-by-collector";
import { ZipHandler } from "../../common/async/zip-handler";
import { RaceHandler } from "../../common/async/race-handler";

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
    if (0 < n) {
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
    if (0 < n) {
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
  if (!(0 < total)) {
    return;
  }

  const handler = new ZipHandler<T>(total);

  let index = 0;
  ss.map((s) => s()).forEach(async (i) => {
    const _index = index++;
    try {
      for await (const x of i) {
        const isRunning = await handler.zip(_index, x);
        if (!isRunning) {
          return;
        }
      }
      handler.end();
    } catch (e) {
      handler.crash(e);
    }
  });

  yield* handler;
}

export async function* race<T>(ss: Func<AsyncIterableIterator<T>>[]) {
  const total = ss.length;
  if (!(0 < total)) {
    return;
  }

  const handler = new RaceHandler<T>(total);

  ss.map((s) => s()).forEach(async (i) => {
    try {
      for await (const x of i) {
        const isRunning = await handler.race(x);
        if (!isRunning) {
          return;
        }
      }
      handler.leave();
    } catch (e) {
      handler.crash(e);
    }
  });

  yield* handler;
}
