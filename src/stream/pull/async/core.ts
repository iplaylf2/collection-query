import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
} from "../../../type";

export async function* map<T, K>(
  iterator: AsyncIterableIterator<T>,
  f: Selector<T, K>
) {
  for await (const x of iterator) {
    yield f(x);
  }
}

export async function* mapAsync<T, K>(
  iterator: AsyncIterableIterator<T>,
  f: AsyncSelector<T, K>
) {
  for await (const x of iterator) {
    yield await f(x);
  }
}

export async function* filter<T>(
  iterator: AsyncIterableIterator<T>,
  f: Predicate<T>
) {
  for await (const x of iterator) {
    if (f(x)) {
      yield x;
    }
  }
}

export async function* filterAsync<T>(
  iterator: AsyncIterableIterator<T>,
  f: AsyncPredicate<T>
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
  f: Predicate<T>
) {
  for await (const x of iterator) {
    if (!f(x)) {
      yield x;
    }
  }
}

export async function* removeAsync<T>(
  iterator: AsyncIterableIterator<T>,
  f: AsyncPredicate<T>
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
  f: Predicate<T>
) {
  for await (const x of iterator) {
    if (f(x)) {
      yield x;
    } else {
      break;
    }
  }
}

export async function* takeWhileAsync<T>(
  iterator: AsyncIterableIterator<T>,
  f: AsyncPredicate<T>
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
  f: Predicate<T>
) {
  while (true) {
    const { value, done } = await iterator.next();
    if (done || !f(value)) {
      break;
    }
  }
  yield* iterator;
}

export async function* skipWhileAsync<T>(
  iterator: AsyncIterableIterator<T>,
  f: AsyncPredicate<T>
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

export async function* concat<T>(
  iterator1: AsyncIterableIterator<T>,
  iterator2: AsyncIterableIterator<T>
) {
  for await (const x of iterator1) {
    yield x;
  }
  for await (const x of iterator2) {
    yield x;
  }
}

export * from "./core/zip";

export * from "./core/race";
