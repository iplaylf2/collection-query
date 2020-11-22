import { PushStream } from "./type";
import { relayNext as _relay_next, RelayNextHandler } from "./push/relay-next";
import { Action, Selector, Predicate, Aggregate } from "../type";
import * as core from "./push/core";
import { relay } from "./push/relay";
import { reduce as _reduce } from "./push/reduce";
import { EmitType, EmitForm } from "./push/type";
import { create as _create } from "./push/create";
import { createFrom as _createFrom } from "./push/create-from";

const relay_next: <T, Te, K = T>(
  handler: RelayNextHandler<T, K>
) => (s: PushStream<T, Te>) => PushStream<K, Te> = _relay_next;

export const create: <T, Te = never>(
  executor: Action<EmitForm<T, Te>>
) => PushStream<T, Te> = _create;

export const createFrom: <T>(
  i: Iterable<T>
) => PushStream<T, any> = _createFrom;

export function forEach<T>(s: PushStream<T, any>, f: Action<T>) {
  s((t, x?) => {
    if (t === EmitType.Next) {
      f(x!);
    }
  });
}

export function map<T, Te, K>(f: Selector<T, K>) {
  return relay_next<T, Te, K>((emit) => core.map(emit, f));
}

export function filter<T, Te>(f: Predicate<T>) {
  return relay_next<T, Te>((emit) => core.filter(emit, f));
}

export function remove<T, Te>(f: Predicate<T>) {
  return relay_next<T, Te>((emit) => core.remove(emit, f));
}

export function take<T, Te>(n: number) {
  return relay_next<T, Te>((emit) => core.take(emit, n));
}

export function takeWhile<T, Te>(f: Predicate<T>) {
  return relay_next<T, Te>((emit) => core.takeWhile(emit, f));
}

export function skip<T, Te>(n: number) {
  return relay_next<T, Te>((emit) => core.skip(emit, n));
}

export function skipWhile<T, Te>(f: Predicate<T>) {
  return relay_next<T, Te>((emit) => core.skipWhile(emit, f));
}

export function partition<T, Te>(n: number) {
  return (s: PushStream<T, Te>): PushStream<T[], Te> =>
    relay((emit) => core.partition(s, emit, n));
}

export function partitionBy<T, Te>(f: Selector<T, any>) {
  return (s: PushStream<T, Te>): PushStream<T[], Te> =>
    relay((emit) => core.partitionBy(s, emit, f));
}

export const flatten: <T, Te>(
  s: PushStream<T[], Te>
) => PushStream<T, Te> = relay_next((emit) => core.flatten(emit));

export function groupBy<T, Te, K>(f: Selector<T, K>) {
  return (s: PushStream<T, Te>): PushStream<[K, PushStream<T, Te>], Te> =>
    relay((emit) => core.groupBy(s, emit, f));
}

export function incubate<T, Te>(
  s: PushStream<Promise<T>, Te>
): PushStream<T, Te> {
  return relay((emit) => core.incubate(s, emit));
}

export function concat<T, Te>(
  s1: PushStream<T, Te>,
  s2: PushStream<T, Te>
): PushStream<T, Te> {
  return relay((emit) => core.concat(s1, s2, emit));
}

export function concatAll<T, Te>([s, ...ss]: PushStream<T, Te>[]) {
  return ss.reduce((r, s) => concat(r, s), s);
}

export function zip<T, Te>(ss: PushStream<T, Te>[]): PushStream<T[], Te> {
  return relay((emit) => core.zip(ss, emit));
}

export function race<T, Te>(ss: PushStream<T, Te>[]): PushStream<T, Te> {
  return relay((emit) => core.race(ss, emit));
}

export function reduce<T, K>(s: PushStream<T>, f: Aggregate<T, K>, v: K) {
  return _reduce<T, K>((x, j) => core.reduce(x, j, f, v))(s);
}

export function count(s: PushStream<any>) {
  return _reduce<any, number>(core.count)(s);
}

export function include<T>(s: PushStream<T>, v: T) {
  return _reduce<T, boolean>((x, j) => core.include(x, j, v))(s);
}

export function every<T>(s: PushStream<T>, f: Predicate<T>) {
  return _reduce<T, boolean>((x, j) => core.every(x, j, f))(s);
}

export function some<T>(s: PushStream<T>, f: Predicate<T>) {
  return _reduce<T, boolean>((x, j) => core.some(x, j, f))(s);
}

export function first<T>(s: PushStream<T>) {
  return _reduce<T, T | void>(core.first)(s);
}

export function last<T>(s: PushStream<T>) {
  return _reduce<T, T | void>(core.last)(s);
}
