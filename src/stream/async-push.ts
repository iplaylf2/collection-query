import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
  Aggregate,
  AsyncAggregate,
} from "../type";
import { Emitter } from "./push/async/type";
import { relayNext } from "./push/async/relay-next";
import * as core from "./push/async/core";
import { relay } from "./push/async/relay";
import { reduce as _reduce } from "./push/async/reduce";
import { relay as relaySync } from "./push/relay";

export function map<T, Te, K>(f: Selector<T, K> | AsyncSelector<T, K>) {
  return relayNext<T, Te, K>((emit) => core.map(emit, f));
}

export function filter<T, Te>(f: Predicate<T> | AsyncPredicate<T>) {
  return relayNext<T, Te>((emit) => core.filter(emit, f));
}

export function remove<T, Te>(f: Predicate<T> | AsyncPredicate<T>) {
  return relayNext<T, Te>((emit) => core.remove(emit, f));
}

export function take<T, Te>(n: number) {
  return relayNext<T, Te>((emit) => core.take(emit, n));
}

export function takeWhile<T, Te>(f: Predicate<T> | AsyncPredicate<T>) {
  return relayNext<T, Te>((emit) => core.takeWhile(emit, f));
}

export function skip<T, Te>(n: number) {
  return relayNext<T, Te>((emit) => core.skip(emit, n));
}

export function skipWhile<T, Te>(f: Predicate<T> | AsyncPredicate<T>) {
  return relayNext<T, Te>((emit) => core.skipWhile(emit, f));
}

export function concat<T, Te>(
  s1: Emitter<T, Te>,
  s2: Emitter<T, Te>
): Emitter<T, Te> {
  return relay((emit) => core.concat(s1, s2, emit));
}

export function concatAll<T, Te>([s, ...ss]: Emitter<T, Te>[]) {
  return ss.reduce((r, s) => concat(r, s), s);
}

export function zip<T, Te>(ss: Emitter<T, Te>[]): Emitter<T[], Te> {
  return relay((emit) => core.zip(ss, emit));
}

export function race<T, Te>(ss: Emitter<T, Te>[]): Emitter<T, Te> {
  return relay((emit) => core.race(ss, emit));
}

export function reduce<T, K>(
  s: Emitter<T>,
  f: Aggregate<T, K> | AsyncAggregate<T, K>,
  v: K
) {
  return _reduce<T, K>((x, j) => core.reduce(x, j, f, v))(s);
}

export function count(s: Emitter<any>) {
  return _reduce<any, number>(core.count)(s);
}

export function include<T>(s: Emitter<T>, v: T) {
  return _reduce<T, boolean>((x, j) => core.include(x, j, v))(s);
}

export function every<T>(s: Emitter<T>, f: Predicate<T> | AsyncPredicate<T>) {
  return _reduce<T, boolean>((x, j) => core.every(x, j, f))(s);
}

export function some<T>(s: Emitter<T>, f: Predicate<T> | AsyncPredicate<T>) {
  return _reduce<T, boolean>((x, j) => core.some(x, j, f))(s);
}

export function first<T>(s: Emitter<T>) {
  return _reduce<T, T | void>(core.first)(s);
}

export function last<T>(s: Emitter<T>) {
  return _reduce<T, T | void>(core.last)(s);
}

export function sync<T, Te>(s: Emitter<T, Te>) {
  return relaySync<T, Te>(s as any);
}
