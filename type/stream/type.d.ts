import { Func } from "../type";
import { Emitter } from "./push/type";
import { Emitter as AsyncEmitter } from "./push/async/type";
export declare type PullStream<T> = Func<IterableIterator<T>>;
export declare type AsyncPullStream<T> = Func<AsyncIterableIterator<T>>;
export declare type PushStream<T, Te = never> = Emitter<T, Te>;
export declare type AsyncPushStream<T, Te = never> = AsyncEmitter<T, Te>;
