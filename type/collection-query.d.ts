export { PullStream, AsyncPullStream, PushStream, AsyncPushStream, } from "./stream/type";
export { IterateItem } from "./stream/pull/type";
export { EmitType, EmitItem } from "./stream/push/type";
declare type Map<T, K> = (x: T) => K;
declare type DoMap<T extends Map<K, any>, K> = T extends Map<K, infer U> ? U : never;
declare type RecurMap<T extends Map<any, any>[], K> = [...T] extends [
    infer U,
    ...infer R
] ? U extends Map<K, any> ? R extends Map<any, any>[] ? RecurMap<R, DoMap<U, K>> : never : never : K;
export declare function transfer<T, K extends Map<any, any>[]>(s: T, list: [...K]): RecurMap<[...K], T>;
