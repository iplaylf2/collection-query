import { Func } from "../type";
import { Emitter } from "./push/type";
import { Emitter as AsyncEmitter } from "./push/async/type";

export type PullStream<T> = Func<IterableIterator<T>>;
export type AsyncPullStream<T> = Func<AsyncIterableIterator<T>>;
export type PushStream<T> = Emitter<T>;
export type AsyncPushStream<T> = AsyncEmitter<T>;
