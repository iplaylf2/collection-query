import { Func } from "../type";
import { Emitter } from "./push/type";
import { Emitter as AsyncEmitter } from "./push/async/type";

export type PullStream<T> = Func<IterableIterator<T>>;
export type AsyncPullStream<T> = Func<AsyncIterableIterator<T>>;
export type PushStream<T, Te = never> = Emitter<T, Te>;
export type AsyncPushStream<T, Te = never> = AsyncEmitter<T, Te>;
