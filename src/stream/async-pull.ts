import { AsyncPullStream } from "./type";
import {
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
  s: AsyncPullStream<T>,
  f: Action<T> | AsyncAction<T>
) {
  for await (const x of s()) {
    await f(x);
  }
}

export function map<T, K>(f: Selector<T, K> | AsyncSelector<T, K>) {
  return (s: AsyncPullStream<T>): AsyncPullStream<K> => () => core.map(s(), f);
}

export function filter<T>(f: Predicate<T> | AsyncPredicate<T>) {
  return (s: AsyncPullStream<T>): AsyncPullStream<T> => () =>
    core.filter(s(), f);
}

export function remove<T>(f: Predicate<T> | AsyncPredicate<T>) {
  return (s: AsyncPullStream<T>): AsyncPullStream<T> => () =>
    core.remove(s(), f);
}

export function take<T>(n: number) {
  return (s: AsyncPullStream<T>): AsyncPullStream<T> => () => core.take(s(), n);
}

export function takeWhile<T>(f: Predicate<T> | AsyncPredicate<T>) {
  return (s: AsyncPullStream<T>): AsyncPullStream<T> => () =>
    core.takeWhile(s(), f);
}

export function skip<T>(n: number) {
  return (s: AsyncPullStream<T>): AsyncPullStream<T> => () => core.skip(s(), n);
}

export function skipWhile<T>(f: Predicate<T> | AsyncPredicate<T>) {
  return (s: AsyncPullStream<T>): AsyncPullStream<T> => () =>
    core.skipWhile(s(), f);
}

export function concat<T>(
  s1: AsyncPullStream<T>,
  s2: AsyncPullStream<T>
): AsyncPullStream<T> {
  return () => core.concat(s1, s2);
}

export function concatAll<T>([s, ...ss]: AsyncPullStream<T>[]): AsyncPullStream<
  T
> {
  return ss.reduce((r, s) => concat(r, s), s);
}

export function zip<T>(ss: AsyncPullStream<T>[]): AsyncPullStream<T[]> {
  return () => core.zip(ss);
}

export function race<T>(ss: AsyncPullStream<T>[]): AsyncPullStream<T> {
  return () => core.race(ss);
}

export async function reduce<T, K>(
  s: AsyncPullStream<T>,
  f: Aggregate<T, K> | AsyncAggregate<T, K>,
  v: K
) {
  var r = v;
  for await (const x of s()) {
    r = await f(r, x);
  }
  return r;
}

export async function count(s: AsyncPullStream<any>) {
  var n = 0;
  for await (const _x of s()) {
    n++;
  }
  return n;
}

export async function include<T>(s: AsyncPullStream<T>, x: T) {
  for await (const y of s()) {
    if (x === y) {
      return true;
    }
  }
  return false;
}

export async function every<T>(
  s: AsyncPullStream<T>,
  f: Predicate<T> | AsyncPredicate<T>
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
  s: AsyncPullStream<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  for await (const x of s()) {
    const p = await f(x);
    if (p) {
      return true;
    }
  }
  return false;
}

export async function first<T>(s: AsyncPullStream<T>) {
  const { value } = await s().next();
  return value;
}

export async function last<T>(s: AsyncPullStream<T>) {
  var last;
  for await (const x of s()) {
    last = x;
  }
  return last;
}
