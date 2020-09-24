import { AsyncPushStream, PushStream } from "../type";
export declare const sync: <T, Te>(s: AsyncPushStream<T, Te>) => PushStream<T, Te>;
