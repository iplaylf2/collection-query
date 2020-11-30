import { AsyncPushStream, PushStream } from "../type";
export declare const sync: <T>(s: AsyncPushStream<T>) => PushStream<T>;
