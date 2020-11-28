import { AsyncPushStream } from "./type";
import {
  relayNext as _relay_next,
  RelayNextHandler,
} from "./push/async/relay-next";
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
import * as core from "./push/async/core";
import { relay } from "./push/async/relay";
import { reduce as _reduce } from "./push/async/reduce";
import { EmitType } from "./push/type";
import { Executor } from "./push/async/type";
import { create as _create } from "./push/async/create";
import { createFrom as _createFrom } from "./push/async/create-from";

const relay_next: <T, K = T>(
  handler: RelayNextHandler<T, K>
) => (s: AsyncPushStream<T>) => AsyncPushStream<K> = _relay_next;

export const create: <T = never>(
  executor: Executor<T>
) => AsyncPushStream<T> = _create;

export const createFrom: <T>(
  i: Iterable<T>
) => AsyncPushStream<T> = _createFrom;

export function forEach<T>(
  s: AsyncPushStream<T>,
  f: Action<T> | AsyncAction<T>
) {
  s(async (t, x?) => {
    if (t === EmitType.Next) {
      await f(x!);
    }
  });
}

export function map<T, K>(f: Selector<T, K> | AsyncSelector<T, K>) {
  return relay_next<T, K>((emit) => core.map(emit, f));
}

export function filter<T>(f: Predicate<T> | AsyncPredicate<T>) {
  return relay_next<T>((emit) => core.filter(emit, f));
}

export function remove<T>(f: Predicate<T> | AsyncPredicate<T>) {
  return relay_next<T>((emit) => core.remove(emit, f));
}

export function take<T>(n: number) {
  return relay_next<T>((emit) => core.take(emit, n));
}

export function takeWhile<T>(f: Predicate<T> | AsyncPredicate<T>) {
  return relay_next<T>((emit) => core.takeWhile(emit, f));
}

export function skip<T>(n: number) {
  return relay_next<T>((emit) => core.skip(emit, n));
}

export function skipWhile<T>(f: Predicate<T> | AsyncPredicate<T>) {
  return relay_next<T>((emit) => core.skipWhile(emit, f));
}

export function partition<T>(n: number) {
  return (s: AsyncPushStream<T>): AsyncPushStream<T[]> =>
    relay((emit, expose) => core.partition(s, emit, expose, n));
}

export function partitionBy<T>(f: Selector<T, any>) {
  return (s: AsyncPushStream<T>): AsyncPushStream<T[]> =>
    relay((emit, expose) => core.partitionBy(s, emit, expose, f));
}

export const flatten: <T>(
  s: AsyncPushStream<T[]>
) => AsyncPushStream<T> = relay_next((emit) => core.flatten(emit));

export function _flatten<T>() {
  return relay_next<T[], T>((emit) => core.flatten(emit));
}

export function incubate<T>(
  s: AsyncPushStream<Promise<T>>
): AsyncPushStream<T> {
  return relay((emit, expose) => core.incubate(s, emit, expose));
}

export function _incubate<T>() {
  return (s: AsyncPushStream<Promise<T>>): AsyncPushStream<T> =>
    relay((emit, expose) => core.incubate(s, emit, expose));
}

export function concat<T>(
  s1: AsyncPushStream<T>,
  s2: AsyncPushStream<T>
): AsyncPushStream<T> {
  return relay((emit, expose) => core.concat(s1, s2, emit, expose));
}

export function concatAll<T>([s, ...ss]: AsyncPushStream<T>[]) {
  return ss.reduce((r, s) => concat(r, s), s);
}

export function zip<T>(ss: AsyncPushStream<T>[]): AsyncPushStream<T[]> {
  return relay((emit, expose) => core.zip(ss, emit, expose));
}

export function race<T>(ss: AsyncPushStream<T>[]): AsyncPushStream<T> {
  return relay((emit, expose) => core.race(ss, emit, expose));
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
