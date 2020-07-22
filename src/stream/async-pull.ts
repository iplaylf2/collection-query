import {
  Func,
  Action,
  AsyncAction,
  Selector,
  AsyncSelector,
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

export function map<T, K>(f: Selector<T, K>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<K>> => () => core.map(s(), f);
}

export function mapAsync<T, K>(f: AsyncSelector<T, K>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<K>> => () => core.mapAsync(s(), f);
}

export function filter<T>(f: Predicate<T>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.filter(s(), f);
}

export function filterAsync<T>(f: AsyncPredicate<T>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.filterAsync(s(), f);
}

export function remove<T>(f: Predicate<T>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.remove(s(), f);
}

export function removeAsync<T>(f: AsyncPredicate<T>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.removeAsync(s(), f);
}

export function take<T>(n: number) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.take(s(), n);
}

export function takeWhile<T>(f: Predicate<T>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.takeWhile(s(), f);
}

export function takeWhileAsync<T>(f: AsyncPredicate<T>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.takeWhileAsync(s(), f);
}

export function skip<T>(n: number) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.skip(s(), n);
}

export function skipWhile<T>(f: Predicate<T>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.skipWhile(s(), f);
}

export function skipWhileAsync<T>(f: AsyncPredicate<T>) {
  return (
    s: Func<AsyncIterableIterator<T>>
  ): Func<AsyncIterableIterator<T>> => () => core.skipWhileAsync(s(), f);
}

export function concat<T>(
  s1: Func<AsyncIterableIterator<T>>,
  s2: Func<AsyncIterableIterator<T>>
): Func<AsyncIterableIterator<T>> {
  return () => core.concat(s1, s2);
}

export function concatAll<T>([s, ...ss]: Func<
  AsyncIterableIterator<T>
>[]): Func<AsyncIterableIterator<T>> {
  return ss.reduce((r, s) => concat(r, s), s);
}

export function zip<T>(
  ss: Func<AsyncIterableIterator<T>>[]
): Func<AsyncIterableIterator<T[]>> {
  return () => core.zip(ss);
}

export function race<T>(
  ss: Func<AsyncIterableIterator<T>>[]
): Func<AsyncIterableIterator<T>> {
  return () => core.race(ss);
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

export async function count(s: Func<AsyncIterableIterator<any>>) {
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
