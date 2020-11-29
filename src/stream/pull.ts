import { PullStream } from "./type";
import { Action, Selector, Predicate, Aggregate } from "../type";
import * as core from "./pull/core";

export function createFrom<T>(i: Iterable<T>): PullStream<T> {
  return function* () {
    for (const x of i) {
      yield x;
    }
  };
}

export function forEach<T>(s: PullStream<T>, f: Action<T>) {
  for (const x of s()) {
    f(x);
  }
}

export function map<T, K>(f: Selector<T, K>) {
  return (s: PullStream<T>): PullStream<K> => () => core.map(s(), f);
}

export function filter<T>(f: Predicate<T>) {
  return (s: PullStream<T>): PullStream<T> => () => core.filter(s(), f);
}

export function remove<T>(f: Predicate<T>) {
  return (s: PullStream<T>): PullStream<T> => () => core.remove(s(), f);
}

export function take<T>(n: number) {
  return (s: PullStream<T>): PullStream<T> => () => core.take(s(), n);
}

export function takeWhile<T>(f: Predicate<T>) {
  return (s: PullStream<T>): PullStream<T> => () => core.takeWhile(s(), f);
}

export function* skip<T>(n: number) {
  return (s: PullStream<T>): PullStream<T> => () => core.skip(s(), n);
}

export function skipWhile<T>(f: Predicate<T>) {
  return (s: PullStream<T>): PullStream<T> => () => core.skipWhile(s(), f);
}

export function partition<T>(n: number) {
  return (s: PullStream<T>): PullStream<T[]> => () => core.partition(s(), n);
}

export function partitionBy<T>(f: Selector<T, any>) {
  return (s: PullStream<T>): PullStream<T[]> => () => core.partitionBy(s(), f);
}

export function flatten<T>(s: PullStream<T[]>): PullStream<T> {
  return () => core.flatten(s());
}

export function _flatten<T>() {
  return (s: PullStream<T[]>): PullStream<T> => {
    return () => core.flatten(s());
  };
}

export function concat<T>(s1: PullStream<T>, s2: PullStream<T>): PullStream<T> {
  return () => core.concat(s1, s2);
}

export function concatAll<T>([s, ...ss]: PullStream<T>[]) {
  return ss.reduce((r, s) => concat(r, s), s);
}

export function zip<T>(ss: PullStream<T>[]): PullStream<T[]> {
  return () => core.zip(ss);
}

export function reduce<T, K>(s: PullStream<T>, f: Aggregate<T, K>, v: K) {
  let r = v;
  for (const x of s()) {
    r = f(r, x);
  }
  return r;
}

export function count(s: PullStream<any>) {
  let n = 0;
  for (const _x of s()) {
    n++;
  }
  return n;
}

export function include<T>(s: PullStream<T>, x: T) {
  for (const y of s()) {
    if (x === y) {
      return true;
    }
  }
  return false;
}

export function every<T>(s: PullStream<T>, f: Predicate<T>) {
  for (const x of s()) {
    if (!f(x)) {
      return false;
    }
  }
  return true;
}

export function some<T>(s: PullStream<T>, f: Predicate<T>) {
  for (const x of s()) {
    if (f(x)) {
      return true;
    }
  }
  return false;
}

export function first<T>(s: PullStream<T>) {
  const [value] = s();
  return value as T | void;
}

export function last<T>(s: PullStream<T>) {
  let last;
  for (const x of s()) {
    last = x;
  }
  return last as T | void;
}
