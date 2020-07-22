import {
  Func,
  Action,
  AsyncAction,
  Predicate,
  AsyncPredicate,
  Aggregate,
  AsyncAggregate,
} from "../type";
import * as core from "./pull/async/core";

export async function forEach<T>(
  s: Func<AsyncIterableIterator<T>>,
  f: Action<T>
) {
  for await (const x of s()) {
    f(x);
  }
}

export async function forEachAsync<T>(
  s: Func<AsyncIterableIterator<T>>,
  f: AsyncAction<T>
) {
  for await (const x of s()) {
    await f(x);
  }
}

export async function map<T>(f: Action<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.map(s(), f);
  };
}

export async function mapAsync<T>(f: AsyncAction<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.mapAsync(s(), f);
  };
}

export async function filter<T>(f: Predicate<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.filter(s(), f);
  };
}

export async function filterAsync<T>(f: AsyncPredicate<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.filterAsync(s(), f);
  };
}

export async function remove<T>(f: Predicate<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.remove(s(), f);
  };
}

export async function removeAsync<T>(f: AsyncPredicate<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.removeAsync(s(), f);
  };
}

export async function take<T>(n: number) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.take(s(), n);
  };
}

export async function takeWhile<T>(f: Predicate<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.takeWhile(s(), f);
  };
}

export async function takeWhileAsync<T>(f: AsyncPredicate<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.takeWhileAsync(s(), f);
  };
}

export async function skip<T>(n: number) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.skip(s(), n);
  };
}

export async function skipWhile<T>(f: Predicate<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.skipWhile(s(), f);
  };
}

export async function skipWhileAsync<T>(f: AsyncPredicate<T>) {
  return function (s: Func<AsyncIterableIterator<T>>) {
    return () => core.skipWhileAsync(s(), f);
  };
}

export async function concat<T>(
  s1: Func<AsyncIterableIterator<T>>,
  s2: Func<AsyncIterableIterator<T>>
) {
  return () => core.concat(s1(), s2());
}

export async function zip<T>(ss: Func<AsyncIterableIterator<T>>[]) {
  return () => core.zip(ss.map((s) => s()));
}

export async function race<T>(ss: Func<AsyncIterableIterator<T>>[]) {
  return () => core.race(ss.map((s) => s()));
}

export async function reduce<T, K>(
  s: Func<AsyncIterableIterator<T>>,
  f: Aggregate<T, K>,
  v: K
) {
  var r = v;
  for await (const x of s()) {
    r = f(r, x);
  }
  return r;
}

export async function reduceAsync<T, K>(
  s: Func<AsyncIterableIterator<T>>,
  f: AsyncAggregate<T, K>,
  v: K
) {
  var r = v;
  for await (const x of s()) {
    r = await f(r, x);
  }
  return r;
}

export async function count<T>(s: Func<AsyncIterableIterator<T>>) {
  var n = 0;
  for await (const _x of s()) {
    n++;
  }
  return n;
}

export async function include<T>(s: Func<AsyncIterableIterator<T>>, x: T) {
  for await (const y of s()) {
    if (x === y) {
      return true;
    }
  }
  return false;
}

export async function every<T>(
  s: Func<AsyncIterableIterator<T>>,
  f: Predicate<T>
) {
  for await (const x of s()) {
    if (!f(x)) {
      return false;
    }
  }
  return true;
}

export async function everyAsync<T>(
  s: Func<AsyncIterableIterator<T>>,
  f: AsyncPredicate<T>
) {
  for await (const x of s()) {
    const p = await f(x);
    if (!p) {
      return false;
    }
  }
  return true;
}

export async function some<T>(
  s: Func<AsyncIterableIterator<T>>,
  f: Predicate<T>
) {
  for await (const x of s()) {
    if (f(x)) {
      return true;
    }
  }
  return false;
}

export async function someAsync<T>(
  s: Func<AsyncIterableIterator<T>>,
  f: AsyncPredicate<T>
) {
  for await (const x of s()) {
    const p = await f(x);
    if (p) {
      return true;
    }
  }
  return false;
}

export async function first<T>(s: Func<AsyncIterableIterator<T>>) {
  const { value } = await s().next();
  return value;
}

export async function last<T>(s: Func<AsyncIterableIterator<T>>) {
  var last;
  for await (const x of s()) {
    last = x;
  }
  return last;
}
