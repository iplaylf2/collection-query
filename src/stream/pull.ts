import Pull from "./pull/pull";
import { Action, Selector, Predicate, Aggregate } from "../type";
import * as core from "./pull/core";

export function forEach<T>(s: Pull<T>, f: Action<T>) {
  for (const x of s) {
    f(x);
  }
}

export function map<T, K>(f: Selector<T, K>) {
  return function (s: Pull<T>) {
    return new Pull(() => core.map(s, f));
  };
}

export function filter<T>(f: Predicate<T>) {
  return function (s: Pull<T>) {
    return new Pull(() => core.filter(s, f));
  };
}

export function remove<T>(f: Predicate<T>) {
  return function (s: Pull<T>) {
    return new Pull(() => core.remove(s, f));
  };
}

export function take<T>(n: number) {
  return function (s: Pull<T>) {
    return new Pull(() => core.take(s, n));
  };
}

export function takeWhile<T>(f: Predicate<T>) {
  return function (s: Pull<T>) {
    return new Pull(() => core.takeWhile(s, f));
  };
}

export function* skip<T>(n: number) {
  return function (s: Pull<T>) {
    return new Pull(() => core.skip(s, n));
  };
}

export function skipWhile<T>(f: Predicate<T>) {
  return function (s: Pull<T>) {
    return new Pull(() => core.skipWhile(s, f));
  };
}

export function concat<T>(s1: Pull<T>, s2: Pull<T>) {
  return new Pull(() => core.concat(s1, s2));
}

export function zip<T>(ss: Pull<T>[]) {
  return new Pull(() => core.zip(ss));
}

export function reduce<T, K>(s: Pull<T>, f: Aggregate<T, K>, v: K) {
  let r = v;
  for (const x of s) {
    r = f(r, x);
  }
  return r;
}

export function count<T>(s: Pull<T>) {
  let n = 0;
  for (const _x of s) {
    n++;
  }
  return n;
}

export function include<T>(s: Pull<T>, x: T) {
  for (const y of s) {
    if (x === y) {
      return true;
    }
  }
  return false;
}

export function every<T>(s: Pull<T>, f: Predicate<T>) {
  for (const x of s) {
    if (!f(x)) {
      return false;
    }
  }
  return true;
}

export function some<T>(s: Pull<T>, f: Predicate<T>) {
  for (const x of s) {
    if (f(x)) {
      return true;
    }
  }
  return false;
}

export function first<T>(s: Pull<T>) {
  const [value] = s;
  return value;
}

export function last<T>(s: Pull<T>) {
  let last;
  for (const x of s) {
    last = x;
  }
  return last;
}
