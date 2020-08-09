import { AsyncPushStream, PushStream } from "./type";
import {
  relayNext as _relay_next,
  RelayNextHandler,
} from "./push/async/relay-next";
import {
  Selector,
  AsyncSelector,
  Predicate,
  AsyncPredicate,
  Aggregate,
  AsyncAggregate,
} from "../type";
import * as core from "./push/async/core";
import { relay } from "./push/async/relay";
import { reduce as _reduce } from "./push/async/reduce";
import { relay as relay_sync } from "./push/relay";

const relay_next: <T, Te, K = T>(
  handler: RelayNextHandler<T, Te, K>
) => (s: AsyncPushStream<T, Te>) => AsyncPushStream<K, Te> = _relay_next;

export function map<T, Te, K>(f: Selector<T, K> | AsyncSelector<T, K>) {
  return relay_next<T, Te, K>((emit) => core.map(emit, f));
}

export function filter<T, Te>(f: Predicate<T> | AsyncPredicate<T>) {
  return relay_next<T, Te>((emit) => core.filter(emit, f));
}

export function remove<T, Te>(f: Predicate<T> | AsyncPredicate<T>) {
  return relay_next<T, Te>((emit) => core.remove(emit, f));
}

export function take<T, Te>(n: number) {
  return relay_next<T, Te>((emit) => core.take(emit, n));
}

export function takeWhile<T, Te>(f: Predicate<T> | AsyncPredicate<T>) {
  return relay_next<T, Te>((emit) => core.takeWhile(emit, f));
}

export function skip<T, Te>(n: number) {
  return relay_next<T, Te>((emit) => core.skip(emit, n));
}

export function skipWhile<T, Te>(f: Predicate<T> | AsyncPredicate<T>) {
  return relay_next<T, Te>((emit) => core.skipWhile(emit, f));
}

export function partition<T, Te>(n: number) {
  return (s: AsyncPushStream<T, Te>): AsyncPushStream<T[], Te> =>
    relay((emit) => core.partition(s, emit, n));
}

export function partitionBy<T, Te>(f: Selector<T, any>) {
  return (s: AsyncPushStream<T, Te>): AsyncPushStream<T[], Te> =>
    relay((emit) => core.partitionBy(s, emit, f));
}

export function concat<T, Te>(
  s1: AsyncPushStream<T, Te>,
  s2: AsyncPushStream<T, Te>
): AsyncPushStream<T, Te> {
  return relay((emit) => core.concat(s1, s2, emit));
}

export function concatAll<T, Te>([s, ...ss]: AsyncPushStream<T, Te>[]) {
  return ss.reduce((r, s) => concat(r, s), s);
}

export function zip<T, Te>(
  ss: AsyncPushStream<T, Te>[]
): AsyncPushStream<T[], Te> {
  return relay((emit) => core.zip(ss, emit));
}

export function race<T, Te>(
  ss: AsyncPushStream<T, Te>[]
): AsyncPushStream<T, Te> {
  return relay((emit) => core.race(ss, emit));
}

export function reduce<T, K>(
  s: AsyncPushStream<T>,
  f: Aggregate<T, K> | AsyncAggregate<T, K>,
  v: K
) {
  return _reduce<T, K>((x, j) => core.reduce(x, j, f, v))(s);
}

export function count(s: AsyncPushStream<any>) {
  return _reduce<any, number>(core.count)(s);
}

export function include<T>(s: AsyncPushStream<T>, v: T) {
  return _reduce<T, boolean>((x, j) => core.include(x, j, v))(s);
}

export function every<T>(
  s: AsyncPushStream<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  return _reduce<T, boolean>((x, j) => core.every(x, j, f))(s);
}

export function some<T>(
  s: AsyncPushStream<T>,
  f: Predicate<T> | AsyncPredicate<T>
) {
  return _reduce<T, boolean>((x, j) => core.some(x, j, f))(s);
}

export function first<T>(s: AsyncPushStream<T>) {
  return _reduce<T, T | void>(core.first)(s);
}

export function last<T>(s: AsyncPushStream<T>) {
  return _reduce<T, T | void>(core.last)(s);
}

export const sync: <T, Te>(
  s: AsyncPushStream<T, Te>
) => PushStream<T, Te> = relay_sync as any;
