export { PullStream, AsyncPullStream, PushStream, AsyncPushStream, } from "./stream/type";
export { IterateItem } from "./stream/pull/type";
export { EmitType, EmitItem } from "./stream/push/type";
export declare function pipe<T = any, K = T>(list: any[]): (x: T) => K;
