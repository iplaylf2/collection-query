import { EmitForm, Emitter } from "./type";
import { Selector, AsyncSelector, Predicate, AsyncPredicate, Action, Aggregate, AsyncAggregate } from "../../../type";
import { EmitItem, Cancel } from "../type";
export declare function map<T, K>(emit: EmitForm<K, never>, f: Selector<T, K> | AsyncSelector<T, K>): (x: T) => Promise<void>;
export declare function filter<T>(emit: EmitForm<T, never>, f: Predicate<T> | AsyncPredicate<T>): (x: T) => Promise<void>;
export declare function remove<T>(emit: EmitForm<T, never>, f: Predicate<T> | AsyncPredicate<T>): (x: T) => Promise<void>;
export declare function take<T>(emit: EmitForm<T, never>, n: number): (x: T) => Promise<void>;
export declare function takeWhile<T>(emit: EmitForm<T, never>, f: Predicate<T> | AsyncPredicate<T>): (x: T) => Promise<void>;
export declare function skip<T>(emit: EmitForm<T, never>, n: number): (x: T) => Promise<void>;
export declare function skipWhile<T>(emit: EmitForm<T, never>, f: Predicate<T> | AsyncPredicate<T>): (x: T) => Promise<void>;
export declare function partition<T>(emitter: Emitter<T, any>, emit: EmitForm<T[], any>, expose: Action<Cancel>, n: number): void;
export declare function partitionBy<T>(emitter: Emitter<T, any>, emit: EmitForm<T[], any>, expose: Action<Cancel>, f: Selector<T, any> | AsyncSelector<T, any>): void;
export declare function flatten<T>(emit: EmitForm<T, never>): (xx: T[]) => Promise<void>;
export declare function incubate<T>(emitter: Emitter<Promise<T>, any>, emit: EmitForm<T, any>, expose: Action<Cancel>): void;
export declare function concat<T>(emitter1: Emitter<T, any>, emitter2: Emitter<T, any>, emit: EmitForm<T, any>, expose: Action<Cancel>): void;
export declare function zip<T>(ee: Emitter<T, any>[], emit: EmitForm<T[], any>, expose: Action<Cancel>): void;
export declare function race<T>(ee: Emitter<T, any>[], emit: EmitForm<T, any>, expose: Action<Cancel>): void;
export declare function reduce<T, K>(resolve: Action<K>, reject: Action<any>, f: Aggregate<T, K> | AsyncAggregate<T, K>, v: K): (...[t, x]: EmitItem<T, any>) => Promise<void>;
export declare function count(resolve: Action<number>, reject: Action<any>): (...[t, x]: EmitItem<any, any>) => Promise<void>;
export declare function include<T>(resolve: Action<boolean>, reject: Action<any>, v: T): (...[t, x]: EmitItem<T, any>) => Promise<void>;
export declare function every<T>(resolve: Action<boolean>, reject: Action<any>, f: Predicate<T> | AsyncPredicate<T>): (...[t, x]: EmitItem<T, any>) => Promise<void>;
export declare function some<T>(resolve: Action<boolean>, reject: Action<any>, f: Predicate<T> | AsyncPredicate<T>): (...[t, x]: EmitItem<T, any>) => Promise<void>;
export declare function first<T>(resolve: Action<T | void>, reject: Action<any>): (...[t, x]: EmitItem<T, any>) => Promise<void>;
export declare function last<T>(resolve: Action<T | void>, reject: Action<any>): (...[t, x]: EmitItem<T, any>) => Promise<void>;
