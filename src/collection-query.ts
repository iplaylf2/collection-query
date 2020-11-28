export {
  PullStream,
  AsyncPullStream,
  PushStream,
  AsyncPushStream,
} from "./stream/type";

export { IterateItem } from "./stream/pull/type";
export { EmitType, EmitItem } from "./stream/push/type";

type Map<T, K> = (x: T) => K;
type MapD<T extends Map<K, any>, K> = T extends Map<K, infer U> ? U : never;

type RecurMapD<T extends Map<any, any>[], K> = {
  0: K;
  1: ((..._: T) => any) extends (_: infer U, ...__: infer R) => any
    ? U extends Map<K, any>
      ? R extends Map<any, any>[]
        ? RecurMapD<R, MapD<U, K>>
        : never
      : never
    : never;
}[T extends [any, ...any[]] ? 1 : 0];

export function transfer<T, K extends Map<any, any>[]>(
  s: T,
  list: [...K]
): RecurMapD<[...K], T> {
  return list.reduce((r, f) => f(r), s) as any;
}
