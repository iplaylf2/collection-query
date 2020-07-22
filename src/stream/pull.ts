import { Func, Action, Selector, Predicate, Aggregate } from "../type";
import * as core from "./pull/core";

export function forEach<T>(s: Func<IterableIterator<T>>, f: Action<T>) {
  for (const x of s()) {
    f(x);
  }
}

export function map<T, K>(f: Selector<T, K>) {
  return function (s: Func<IterableIterator<T>>) {
    return () => core.map(s(), f);
  };
}

export function filter<T>(f: Predicate<T>) {
  return function (s: Func<IterableIterator<T>>) {
    return () => core.filter(s(), f);
  };
}

export function remove<T>(f: Predicate<T>) {
  return function (s: Func<IterableIterator<T>>) {
    return () => core.remove(s(), f);
  };
}

export function take<T>(n: number) {
  return function (s: Func<IterableIterator<T>>) {
    return () => core.take(s(), n);
  };
}

export function takeWhile<T>(f: Predicate<T>) {
  return function (s: Func<IterableIterator<T>>) {
    return () => core.takeWhile(s(), f);
  };
}

export function* skip<T>(n: number) {
  return function (s: Func<IterableIterator<T>>) {
    return () => core.skip(s(), n);
  };
}

export function skipWhile<T>(f: Predicate<T>) {
  return function (s: Func<IterableIterator<T>>) {
    return () => core.skipWhile(s(), f);
  };
}

export function concat<T>(
  s1: Func<IterableIterator<T>>,
  s2: Func<IterableIterator<T>>
) {
  return () => core.concat(s1, s2);
}

export function zip<T>(ss: Func<IterableIterator<T>>[]) {
  return () => core.zip(ss);
}

export function reduce<T, K>(
  s: Func<IterableIterator<T>>,
  f: Aggregate<T, K>,
  v: K
) {
  let r = v;
  for (const x of s()) {
    r = f(r, x);
  }
  return r;
}

export function count<T>(s: Func<IterableIterator<T>>) {
  let n = 0;
  for (const _x of s()) {
    n++;
  }
  return n;
}

export function include<T>(s: Func<IterableIterator<T>>, x: T) {
  for (const y of s()) {
    if (x === y) {
      return true;
    }
  }
  return false;
}

export function every<T>(s: Func<IterableIterator<T>>, f: Predicate<T>) {
  for (const x of s()) {
    if (!f(x)) {
      return false;
    }
  }
  return true;
}

export function some<T>(s: Func<IterableIterator<T>>, f: Predicate<T>) {
  for (const x of s()) {
    if (f(x)) {
      return true;
    }
  }
  return false;
}

export function first<T>(s: Func<IterableIterator<T>>) {
  const [value] = s();
  return value;
}

export function last<T>(s: Func<IterableIterator<T>>) {
  let last;
  for (const x of s()) {
    last = x;
  }
  return last;
}
