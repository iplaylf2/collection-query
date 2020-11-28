import { PushStream } from "./type";
import { relayNext as _relay_next, RelayNextHandler } from "./push/relay-next";
import { Action, Selector, Predicate, Aggregate } from "../type";
import * as core from "./push/core";
import { relay } from "./push/relay";
import { reduce as _reduce } from "./push/reduce";
import { EmitType, Executor } from "./push/type";
import { create as _create } from "./push/create";
import { createFrom as _createFrom } from "./push/create-from";

const relay_next: <T, K = T>(
  handler: RelayNextHandler<T, K>
) => (s: PushStream<T>) => PushStream<K> = _relay_next;

export const create: <T>(executor: Executor<T>) => PushStream<T> = _create;

export const createFrom: <T>(i: Iterable<T>) => PushStream<T> = _createFrom;

export function forEach<T>(s: PushStream<T>, f: Action<T>) {
  s((t, x?) => {
    if (t === EmitType.Next) {
      f(x!);
    }
  });
}

export function map<T, K>(f: Selector<T, K>) {
  return relay_next<T, K>((emit) => core.map(emit, f));
}

export function filter<T>(f: Predicate<T>) {
  return relay_next<T>((emit) => core.filter(emit, f));
}

export function remove<T>(f: Predicate<T>) {
  return relay_next<T>((emit) => core.remove(emit, f));
}

export function take<T>(n: number) {
  return relay_next<T>((emit) => core.take(emit, n));
}

export function takeWhile<T>(f: Predicate<T>) {
  return relay_next<T>((emit) => core.takeWhile(emit, f));
}

export function skip<T>(n: number) {
  return relay_next<T>((emit) => core.skip(emit, n));
}

export function skipWhile<T>(f: Predicate<T>) {
  return relay_next<T>((emit) => core.skipWhile(emit, f));
}

export function partition<T>(n: number) {
  return (s: PushStream<T>): PushStream<T[]> =>
    relay((emit, expose) => core.partition(s, emit, expose, n));
}

export function partitionBy<T>(f: Selector<T, any>) {
  return (s: PushStream<T>): PushStream<T[]> =>
    relay((emit, expose) => core.partitionBy(s, emit, expose, f));
}

export const flatten: <T>(
  s: PushStream<T[]>
) => PushStream<T> = relay_next((emit) => core.flatten(emit));

export function _flatten<T>() {
  return relay_next<T[], T>((emit) => core.flatten(emit));
}

export function groupBy<T, K>(f: Selector<T, K>) {
  return (s: PushStream<T>): PushStream<[K, PushStream<T>]> =>
    relay((emit, expose) => core.groupBy(s, emit, expose, f));
}

export function incubate<T>(s: PushStream<Promise<T>>): PushStream<T> {
  return relay((emit, expose) => core.incubate(s, emit, expose));
}

export function _incubate<T>() {
  return (s: PushStream<Promise<T>>): PushStream<T> =>
    relay((emit, expose) => core.incubate(s, emit, expose));
}

export function concat<T>(s1: PushStream<T>, s2: PushStream<T>): PushStream<T> {
  return relay((emit, expose) => core.concat(s1, s2, emit, expose));
}

export function concatAll<T>([s, ...ss]: PushStream<T>[]) {
  return ss.reduce((r, s) => concat(r, s), s);
}

export function zip<T>(ss: PushStream<T>[]): PushStream<T[]> {
  return relay((emit, expose) => core.zip(ss, emit, expose));
}

export function race<T>(ss: PushStream<T>[]): PushStream<T> {
  return relay((emit, expose) => core.race(ss, emit, expose));
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
