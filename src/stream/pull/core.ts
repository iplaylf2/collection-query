import { Selector, Predicate } from "../../util";
import Pull from "./pull";

export function* map<T, K>(s: Pull<T>, f: Selector<T, K>) {
  for (const x of s) {
    yield f(x);
  }
}

export function* filter<T>(s: Pull<T>, f: Predicate<T>) {
  for (const x of s) {
    if (f(x)) {
      yield x;
    }
  }
}

export function* remove<T>(s: Pull<T>, f: Predicate<T>) {
  for (const x of s) {
    if (!f(x)) {
      yield x;
    }
  }
}

export function* take<T>(s: Pull<T>, n: number) {
  for (const x of s) {
    if (n > 0) {
      n--;
      yield x;
    } else {
      break;
    }
  }
}

export function* takeWhile<T>(s: Pull<T>, f: Predicate<T>) {
  for (const x of s) {
    if (f(x)) {
      yield x;
    } else {
      break;
    }
  }
}

export function* skip<T>(s: Pull<T>, n: number) {
  const i = s[Symbol.iterator]();
  while (true) {
    if (n > 0) {
      const { done } = i.next();
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

export function* skipWhile<T>(s: Pull<T>, f: Predicate<T>) {
  const i = s[Symbol.iterator]();
  while (true) {
    const { value, done } = i.next();
    if (done || !f(value)) {
      break;
    }
  }
  yield* i;
}

export function* concat<T>(s1: Pull<T>, s2: Pull<T>) {
  for (const x of s1) {
    yield x;
  }
  for (const x of s2) {
    yield x;
  }
}

export function* zip<T>(ss: Pull<T>[]) {
  const ii = ss.map((s) => s[Symbol.iterator]());

  while (true) {
    const iiResult = ii.map((i) => i.next());
    const done = iiResult.some(({ done }) => done);
    if (done) {
      break;
    } else {
      const result: T[] = iiResult.map(({ value }) => value);
      yield result;
    }
  }
}
