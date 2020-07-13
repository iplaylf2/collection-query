import AsyncPull from "./pull/async/async-pull";
import {
  Action,
  AsyncAction,
  Predicate,
  AsyncPredicate,
  Aggregate,
  AsyncAggregate,
} from "../util";
import * as core from "./pull/async/core";

export async function forEach<T>(s: AsyncPull<T>, f: Action<T>) {
  for await (const x of s) {
    f(x);
  }
}

export async function forEachAsync<T>(s: AsyncPull<T>, f: AsyncAction<T>) {
  for await (const x of s) {
    await f(x);
  }
}

export async function map<T>(s: AsyncPull<T>, f: Action<T>) {
  return new AsyncPull(() => core.map(s, f));
}

export async function mapAsync<T>(s: AsyncPull<T>, f: AsyncAction<T>) {
  return new AsyncPull(() => core.mapAsync(s, f));
}

export async function filter<T>(s: AsyncPull<T>, f: Predicate<T>) {
  return new AsyncPull(() => core.filter(s, f));
}

export async function filterAsync<T>(s: AsyncPull<T>, f: AsyncPredicate<T>) {
  return new AsyncPull(() => core.filterAsync(s, f));
}

export async function remove<T>(s: AsyncPull<T>, f: Predicate<T>) {
  return new AsyncPull(() => core.remove(s, f));
}

export async function removeAsync<T>(s: AsyncPull<T>, f: AsyncPredicate<T>) {
  return new AsyncPull(() => core.removeAsync(s, f));
}

export async function take<T>(s: AsyncPull<T>, n: number) {
  return new AsyncPull(() => core.take(s, n));
}

export async function takeWhile<T>(s: AsyncPull<T>, f: Predicate<T>) {
  return new AsyncPull(() => core.takeWhile(s, f));
}

export async function takeWhileAsync<T>(s: AsyncPull<T>, f: AsyncPredicate<T>) {
  return new AsyncPull(() => core.takeWhileAsync(s, f));
}

export async function skip<T>(s: AsyncPull<T>, n: number) {
  return new AsyncPull(() => core.skip(s, n));
}

export async function skipWhile<T>(s: AsyncPull<T>, f: Predicate<T>) {
  return new AsyncPull(() => core.skipWhile(s, f));
}

export async function skipWhileAsync<T>(s: AsyncPull<T>, f: AsyncPredicate<T>) {
  return new AsyncPull(() => core.skipWhileAsync(s, f));
}

export async function concat<T>(s1: AsyncPull<T>, s2: AsyncPull<T>) {
  return new AsyncPull(() => core.concat(s1, s2));
}

export async function zip<T>(ss: AsyncPull<T>[]) {
  return new AsyncPull(() => core.zip(ss));
}

export async function race<T>(ss: AsyncPull<T>[]) {
  return new AsyncPull(() => core.race(ss));
}

export async function reduce<T, K>(s: AsyncPull<T>, f: Aggregate<T, K>, v: K) {
  var r = v;
  for await (const x of s) {
    r = f(r, x);
  }
  return r;
}

export async function reduceAsync<T, K>(
  s: AsyncPull<T>,
  f: AsyncAggregate<T, K>,
  v: K
) {
  var r = v;
  for await (const x of s) {
    r = await f(r, x);
  }
  return r;
}

export async function count<T>(s: AsyncPull<T>) {
  var n = 0;
  for await (const _x of s) {
    n++;
  }
  return n;
}

export async function include<T>(s: AsyncPull<T>, x: T) {
  for await (const y of s) {
    if (x === y) {
      return true;
    }
  }
  return false;
}

export async function every<T>(s: AsyncPull<T>, f: Predicate<T>) {
  for await (const x of s) {
    if (!f(x)) {
      return false;
    }
  }
  return true;
}

export async function everyAsync<T>(s: AsyncPull<T>, f: AsyncPredicate<T>) {
  for await (const x of s) {
    const p = await f(x);
    if (!p) {
      return false;
    }
  }
  return true;
}

export async function some<T>(s: AsyncPull<T>, f: Predicate<T>) {
  for await (const x of s) {
    if (f(x)) {
      return true;
    }
  }
  return false;
}

export async function someAsync<T>(s: AsyncPull<T>, f: AsyncPredicate<T>) {
  for await (const x of s) {
    const p = await f(x);
    if (p) {
      return true;
    }
  }
  return false;
}

export async function first<T>(s: AsyncPull<T>) {
  const i = s[Symbol.asyncIterator]();
  const { value } = await i.next();
  return value;
}

export async function last<T>(s: AsyncPull<T>) {
  var last;
  for await (const x of s) {
    last = x;
  }
  return last;
}
