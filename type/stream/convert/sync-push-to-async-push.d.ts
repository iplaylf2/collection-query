import { PushStream, AsyncPushStream } from "../type";
export declare const async: <T, Te>(s: PushStream<T, Te>) => AsyncPushStream<T, Te>;
