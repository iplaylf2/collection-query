import { PullStream } from "./type";
import { Action, Selector, Predicate, Aggregate } from "../type";
export declare function createFrom<T>(i: Iterable<T>): PullStream<T>;
export declare function forEach<T>(s: PullStream<T>, f: Action<T>): void;
export declare function map<T, K>(f: Selector<T, K>): (s: PullStream<T>) => PullStream<K>;
export declare function filter<T>(f: Predicate<T>): (s: PullStream<T>) => PullStream<T>;
export declare function remove<T>(f: Predicate<T>): (s: PullStream<T>) => PullStream<T>;
export declare function take<T>(n: number): (s: PullStream<T>) => PullStream<T>;
export declare function takeWhile<T>(f: Predicate<T>): (s: PullStream<T>) => PullStream<T>;
export declare function skip<T>(n: number): Generator<never, (s: PullStream<T>) => PullStream<T>, unknown>;
export declare function skipWhile<T>(f: Predicate<T>): (s: PullStream<T>) => PullStream<T>;
export declare function partition<T>(n: number): (s: PullStream<T>) => PullStream<T[]>;
export declare function partitionBy<T>(f: Selector<T, any>): (s: PullStream<T>) => PullStream<T[]>;
export declare function flatten<T>(s: PullStream<T[]>): PullStream<T>;
export declare function _flatten<T>(): (s: PullStream<T[]>) => PullStream<T>;
export declare function concat<T>(s1: PullStream<T>, s2: PullStream<T>): PullStream<T>;
export declare function concatAll<T>([s, ...ss]: PullStream<T>[]): PullStream<T>;
export declare function zip<T>(ss: PullStream<T>[]): PullStream<T[]>;
export declare function reduce<T, K>(s: PullStream<T>, f: Aggregate<T, K>, v: K): K;
export declare function count(s: PullStream<any>): number;
export declare function include<T>(s: PullStream<T>, x: T): boolean;
export declare function every<T>(s: PullStream<T>, f: Predicate<T>): boolean;
export declare function some<T>(s: PullStream<T>, f: Predicate<T>): boolean;
export declare function first<T>(s: PullStream<T>): T;
export declare function last<T>(s: PullStream<T>): T | undefined;
