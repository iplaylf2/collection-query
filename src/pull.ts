import { Func } from "./type";

export type PullStream<T> = Func<IterableIterator<T>>;
export * from "./stream/pull";
