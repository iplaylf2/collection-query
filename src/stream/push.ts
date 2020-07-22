import { Selector, Predicate, Aggregate } from "../type";
import { Emitter } from "./push/type";
import { relayNext } from "./push/relay-next";
import * as core from "./push/core";
import { relay } from "./push/relay";
import { reduce as _reduce } from "./push/reduce";

export function map<T, Te, K>(f: Selector<T, K>) {
  return (s: Emitter<T, Te>): Emitter<K, Te> =>
    relayNext(s, (emit) => core.map(emit, f));
}

export function filter<T, Te>(f: Predicate<T>) {
  return (s: Emitter<T, Te>): Emitter<T, Te> =>
    relayNext(s, (emit) => core.filter(emit, f));
}

export function remove<T, Te>(f: Predicate<T>) {
  return (s: Emitter<T, Te>): Emitter<T, Te> =>
    relayNext(s, (emit) => core.remove(emit, f));
}

export function take<T, Te>(n: number) {
  return (s: Emitter<T, Te>): Emitter<T, Te> =>
    relayNext(s, (emit) => core.take(emit, n));
}

export function takeWhile<T, Te>(f: Predicate<T>) {
  return (s: Emitter<T, Te>): Emitter<T, Te> =>
    relayNext(s, (emit) => core.takeWhile(emit, f));
}

export function skip<T, Te>(n: number) {
  return (s: Emitter<T, Te>): Emitter<T, Te> =>
    relayNext(s, (emit) => core.skip(emit, n));
}

export function skipWhile<T, Te>(f: Predicate<T>) {
  return (s: Emitter<T, Te>): Emitter<T, Te> =>
    relayNext(s, (emit) => core.skipWhile(emit, f));
}

export function concat<T, Te>(
  s1: Emitter<T, Te>,
  s2: Emitter<T, Te>
): Emitter<T, Te> {
  return relay((emit) => core.concat(s1, s2, emit));
}

export function zip<T, Te>(ss: Emitter<T, Te>[]): Emitter<T[], Te> {
  return relay((emit) => core.zip(ss, emit));
}

export function race<T, Te>(ss: Emitter<T, Te>[]): Emitter<T, Te> {
  return relay((emit) => core.race(ss, emit));
}

export function reduce<T, K>(
  s: Emitter<T>,
  f: Aggregate<T, K>,
  v: K
): Promise<K> {
  return _reduce(s, (x, j) => core.reduce(x, j, f, v));
}

export function count(s: Emitter<any>): Promise<number> {
  return _reduce(s, core.count);
}

export function include<T>(s: Emitter<T>, v: T): Promise<boolean> {
  return _reduce(s, (x, j) => core.include(x, j, v));
}

export function every<T>(s: Emitter<T>, f: Predicate<T>): Promise<boolean> {
  return _reduce(s, (x, j) => core.every(x, j, f));
}

export function some<T>(s: Emitter<T>, f: Predicate<T>): Promise<boolean> {
  return _reduce(s, (x, j) => core.some(x, j, f));
}

export function first<T>(s: Emitter<T>): Promise<T | void> {
  return _reduce(s, core.first);
}

export function last<T>(s: Emitter<T>): Promise<T | void> {
  return _reduce(s, core.last);
}
