import { AsyncPullStream, AsyncPushStream } from "../type";
export declare function push<T>(s: AsyncPullStream<T>): AsyncPushStream<T, any>;
