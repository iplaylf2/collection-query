import { Selector, Predicate, Func } from "../../type";
import { PartitionCollector } from "../common/partition-collector";
import { PartitionByCollector } from "../common/partition-by-collector/partition-by-collector";

export function* map<T, K>(iterator: IterableIterator<T>, f: Selector<T, K>) {
  for (const x of iterator) {
    yield f(x);
  }
}

export function* filter<T>(iterator: IterableIterator<T>, f: Predicate<T>) {
  for (const x of iterator) {
    if (f(x)) {
      yield x;
    }
  }
}

export function* remove<T>(iterator: IterableIterator<T>, f: Predicate<T>) {
  for (const x of iterator) {
    if (!f(x)) {
      yield x;
    }
  }
}

export function* take<T>(iterator: IterableIterator<T>, n: number) {
  for (const x of iterator) {
    if (0 < n) {
      n--;
      yield x;
    } else {
      break;
    }
  }
}

export function* takeWhile<T>(iterator: IterableIterator<T>, f: Predicate<T>) {
  for (const x of iterator) {
    if (f(x)) {
      yield x;
    } else {
      break;
    }
  }
}

export function* skip<T>(iterator: IterableIterator<T>, n: number) {
  while (true) {
    if (0 < n) {
      const { done } = iterator.next();
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

export function* skipWhile<T>(iterator: IterableIterator<T>, f: Predicate<T>) {
  while (true) {
    const { value, done } = iterator.next();
    if (done || !f(value)) {
      break;
    }
  }
  yield* iterator;
}

export function* flatten<T extends K[], K>(iterator: IterableIterator<T>) {
  for (const element of iterator) {
    for (const subElement of element) {
      yield subElement!;
    }
  }
}

export function* partition<T>(iterator: IterableIterator<T>, n: number) {
  const collector = new PartitionCollector<T>(n);

  for (const x of iterator) {
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

export function* partitionBy<T>(
  iterator: IterableIterator<T>,
  f: Predicate<T>
) {
  const collector = new PartitionByCollector<T>(f);

  for (const x of iterator) {
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

export function* concat<T>(
  s1: Func<IterableIterator<T>>,
  s2: Func<IterableIterator<T>>
) {
  for (const x of s1()) {
    yield x;
  }
  for (const x of s2()) {
    yield x;
  }
}

export function* zip<T>(ss: Func<IterableIterator<T>>[]) {
  if (ss.length === 0) {
    return;
  }

  const ii = ss.map((s) => s());

  while (true) {
    const ii_result = ii.map((i) => i.next());
    const done = ii_result.some(({ done }) => done);
    if (done) {
      break;
    } else {
      const result: T[] = ii_result.map(({ value }) => value);
      yield result;
    }
  }
}
