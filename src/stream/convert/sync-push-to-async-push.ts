import { PushStream, AsyncPushStream } from "../type";
import { relay } from "../push/async/relay";

export const async: <T, Te>(
  s: PushStream<T, Te>
) => AsyncPushStream<T, Te> = relay;
