import { AsyncPushStream, PushStream } from "../type";
import { relay } from "../push/relay";

export const sync: <T, Te>(
  s: AsyncPushStream<T, Te>
) => PushStream<T, Te> = relay as any;
