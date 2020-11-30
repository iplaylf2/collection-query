import { AsyncPushStream, AsyncPullStream } from "../type";
export declare function pull<T>(s: AsyncPushStream<T>): AsyncPullStream<T>;
