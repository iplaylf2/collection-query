import { Func } from "./type";

export type AsyncPullStream<T> = Func<AsyncIterableIterator<T>>;
export * from "./stream/async-pull";
