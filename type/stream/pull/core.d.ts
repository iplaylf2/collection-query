import { Selector, Predicate, Func } from "../../type";
export declare function map<T, K>(iterator: IterableIterator<T>, f: Selector<T, K>): Generator<K, void, unknown>;
export declare function filter<T>(iterator: IterableIterator<T>, f: Predicate<T>): Generator<T, void, unknown>;
export declare function remove<T>(iterator: IterableIterator<T>, f: Predicate<T>): Generator<T, void, unknown>;
export declare function take<T>(iterator: IterableIterator<T>, n: number): Generator<T, void, unknown>;
export declare function takeWhile<T>(iterator: IterableIterator<T>, f: Predicate<T>): Generator<T, void, unknown>;
export declare function skip<T>(iterator: IterableIterator<T>, n: number): Generator<T, void, undefined>;
export declare function skipWhile<T>(iterator: IterableIterator<T>, f: Predicate<T>): Generator<T, void, undefined>;
export declare function concat<T>(s1: Func<IterableIterator<T>>, s2: Func<IterableIterator<T>>): Generator<T, void, unknown>;
export declare function zip<T>(ss: Func<IterableIterator<T>>[]): Generator<T[], void, unknown>;
