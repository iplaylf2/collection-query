import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
} from "../../../type";
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

export * from "./core/zip"

export * from "./core/race";
