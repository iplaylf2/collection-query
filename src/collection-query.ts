export {
  PullStream,
  AsyncPullStream,
  PushStream,
  AsyncPushStream,
} from "./stream/type";

export { EmitType, EmitItem, Cancel } from "./stream/push/type";

type Map<T, K> = (x: T) => K;
type DoMap<T extends Map<K, any>, K> = T extends Map<K, infer U> ? U : never;

type RecurMap<T extends Map<any, any>[], K> = [...T] extends [
  infer U,
  ...infer R
]
  ? U extends Map<K, any>
    ? R extends Map<any, any>[]
      ? RecurMap<R, DoMap<U, K>>
      : never
    : never
  : K;

export function transfer<T, K extends Map<any, any>[]>(
  s: T,
  list: [...K]
): RecurMap<[...K], T> {
  return list.reduce((r, f) => f(r), s) as any;
}
